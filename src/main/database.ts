import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export interface AppSettings {
  id?: number
  default_copy_tone: string
  default_image_model: string
  default_video_model: string
  default_image_format: string
  auto_save_generations: number | boolean
  asset_save_path: string
  accent_color: string
}

export interface GeneratedImage {
  id?: number
  campaign_id?: number
  local_path: string
  prompt: string
  model: string
  format: string
  width: number
  height: number
  fal_request_id: string
  created_at?: string
}

export interface CopyVariantRecord {
  id?: number
  campaign_id?: number
  variant_type: string
  platform: string
  headline1?: string
  headline2?: string
  headline3?: string
  hook?: string
  body_copy?: string
  cta?: string
  tone?: string
  triggers_used?: string
  landing_page_part?: string
  video_scripts?: string
  created_at?: string
}

export interface GeneratedVideo {
  id?: number
  campaign_id?: number
  local_path?: string
  prompt: string
  model: string
  resolution: string
  duration: number
  url: string
  fileName: string
  fileSize: number
  createdAt?: string
}

export class DatabaseService {
  private db: Database.Database

  constructor() {
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'monstercreative.db')

    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }

    this.db = new Database(dbPath)
    this.init()
  }

  private init(): void {
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS app_settings (
          id INTEGER PRIMARY KEY,
          default_copy_tone TEXT,
          default_image_model TEXT,
          default_video_model TEXT,
          default_image_format TEXT,
          auto_save_generations INTEGER,
          asset_save_path TEXT,
          accent_color TEXT
        );

        INSERT OR IGNORE INTO app_settings (id, default_copy_tone, default_image_model, default_video_model, default_image_format, auto_save_generations, asset_save_path, accent_color)
        VALUES (1, 'Professional', 'FLUX Pro 1.1', 'Kling 2.0', '1:1', 1, 'C:\\MonsterCreative\\Assets', 'Blue');

        CREATE TABLE IF NOT EXISTS campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          platforms TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Draft',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS generated_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_id INTEGER,
          local_path TEXT,
          prompt TEXT,
          model TEXT,
          format TEXT,
          width INTEGER,
          height INTEGER,
          fal_request_id TEXT,
          created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS generated_videos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_id INTEGER,
          local_path TEXT,
          prompt TEXT,
          model TEXT,
          format TEXT,
          duration_seconds INTEGER,
          source_type TEXT,
          source_path TEXT,
          fal_request_id TEXT,
          created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS copy_variants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_id INTEGER,
          variant_type TEXT,
          platform TEXT,
          headline1 TEXT,
          headline2 TEXT,
          headline3 TEXT,
          hook TEXT,
          body_copy TEXT,
          cta TEXT,
          tone TEXT,
          triggers_used TEXT,
          landing_page_part TEXT,
          video_scripts TEXT,
          created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS custom_voices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          embedding_path TEXT NOT NULL,
          sample_path TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ad_projects (
          id TEXT PRIMARY KEY,
          status TEXT NOT NULL,
          source_images TEXT,
          reference_sheet_url TEXT,
          product_name TEXT,
          brand_name TEXT,
          platform TEXT,
          aspect_ratio TEXT,
          duration INTEGER,
          vibe TEXT,
          creative_direction TEXT,
          storyboard_visual_prompt TEXT,
          seedance_video_prompt TEXT,
          seedance_negative_prompt TEXT,
          voiceover_script TEXT,
          music_prompt TEXT,
          storyboard_image_url TEXT,
          final_video_url TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `)
    } catch (err: unknown) {
      console.error('Database core init failed:', err instanceof Error ? err.message : String(err))
    }

    // --- MIGRATIONS ---
    const migrations = [
      'ALTER TABLE generated_videos ADD COLUMN resolution TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN url TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN file_name TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN file_size INTEGER;',
      'ALTER TABLE generated_videos ADD COLUMN created_at TEXT;'
    ]

    for (const sql of migrations) {
      try {
        this.db.exec(sql)
      } catch (err: unknown) {
        // Ignore "duplicate column name" errors
        if (err instanceof Error && !err.message.includes('duplicate column name')) {
          console.error('Migration failed:', sql, err.message)
        }
      }
    }
  }

  // --- Settings ---
  getSettings(): AppSettings | undefined {
    return this.db.prepare('SELECT * FROM app_settings WHERE id = 1').get() as
      | AppSettings
      | undefined
  }

  updateSettings(settings: AppSettings): Database.RunResult {
    const stmt = this.db.prepare(`
      UPDATE app_settings SET 
        default_copy_tone = ?, 
        default_image_model = ?, 
        default_video_model = ?, 
        default_image_format = ?, 
        auto_save_generations = ?, 
        asset_save_path = ?, 
        accent_color = ?
      WHERE id = 1
    `)
    return stmt.run(
      settings.default_copy_tone,
      settings.default_image_model,
      settings.default_video_model,
      settings.default_image_format,
      settings.auto_save_generations ? 1 : 0,
      settings.asset_save_path,
      settings.accent_color
    )
  }

  // --- Campaigns ---
  getAllCampaigns(): unknown[] {
    return this.db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all()
  }

  createCampaign(name: string, platforms: string): number | bigint {
    const now = new Date().toISOString()
    const stmt = this.db.prepare(`
      INSERT INTO campaigns (name, platforms, status, created_at, updated_at)
      VALUES (?, ?, 'Draft', ?, ?)
    `)
    const result = stmt.run(name, platforms, now, now)
    return result.lastInsertRowid
  }

  // --- Content Saving ---
  saveImage(img: GeneratedImage): number | bigint {
    const stmt = this.db.prepare(`
      INSERT INTO generated_images
        (campaign_id, local_path, prompt, model, format, width, height, fal_request_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      img.campaign_id,
      img.local_path,
      img.prompt,
      img.model,
      img.format,
      img.width,
      img.height,
      img.fal_request_id,
      new Date().toISOString()
    ).lastInsertRowid
  }

  saveCopyVariant(v: CopyVariantRecord): number | bigint {
    const stmt = this.db.prepare(`
      INSERT INTO copy_variants
        (campaign_id, variant_type, platform, headline1, headline2, headline3,
         hook, body_copy, cta, tone, triggers_used, landing_page_part, video_scripts, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      v.campaign_id,
      v.variant_type,
      v.platform,
      v.headline1,
      v.headline2,
      v.headline3,
      v.hook,
      v.body_copy,
      v.cta,
      v.tone,
      v.triggers_used,
      v.landing_page_part,
      v.video_scripts,
      new Date().toISOString()
    ).lastInsertRowid
  }

  saveGeneratedVideo(video: GeneratedVideo): number | bigint {
    const stmt = this.db.prepare(`
      INSERT INTO generated_videos
        (prompt, model, resolution, duration_seconds, url, file_name, file_size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      video.prompt,
      video.model,
      video.resolution,
      video.duration,
      video.url,
      video.fileName,
      video.fileSize,
      video.createdAt || new Date().toISOString()
    ).lastInsertRowid
  }

  // --- Custom Voices ---
  saveCustomVoice(voice: {
    name: string
    embeddingPath: string
    samplePath?: string
  }): number | bigint {
    const stmt = this.db.prepare(`
      INSERT INTO custom_voices (name, embedding_path, sample_path, created_at)
      VALUES (?, ?, ?, ?)
    `)
    const result = stmt.run(
      voice.name,
      voice.embeddingPath,
      voice.samplePath || null,
      new Date().toISOString()
    )
    return result.lastInsertRowid
  }

  getAllCustomVoices(): unknown[] {
    return this.db.prepare('SELECT * FROM custom_voices ORDER BY created_at DESC').all()
  }

  deleteCustomVoice(id: number): Database.RunResult {
    return this.db.prepare('DELETE FROM custom_voices WHERE id = ?').run(id)
  }

  // --- Ad Maker Projects ---
  getAdProject(id: string): any {
    const row = this.db.prepare('SELECT * FROM ad_projects WHERE id = ?').get(id) as any
    if (!row) return null
    return this.parseAdProjectRow(row)
  }

  getAllAdProjects(): any[] {
    const rows = this.db.prepare('SELECT * FROM ad_projects ORDER BY updated_at DESC').all()
    return rows.map((r) => this.parseAdProjectRow(r))
  }

  saveAdProject(project: any): void {
    const stmt = this.db.prepare(`
      INSERT INTO ad_projects (
        id, status, source_images, reference_sheet_url,
        product_name, brand_name, platform, aspect_ratio, duration, vibe, creative_direction,
        storyboard_visual_prompt, seedance_video_prompt, seedance_negative_prompt,
        voiceover_script, music_prompt, storyboard_image_url, final_video_url,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        source_images = excluded.source_images,
        reference_sheet_url = excluded.reference_sheet_url,
        product_name = excluded.product_name,
        brand_name = excluded.brand_name,
        platform = excluded.platform,
        aspect_ratio = excluded.aspect_ratio,
        duration = excluded.duration,
        vibe = excluded.vibe,
        creative_direction = excluded.creative_direction,
        storyboard_visual_prompt = excluded.storyboard_visual_prompt,
        seedance_video_prompt = excluded.seedance_video_prompt,
        seedance_negative_prompt = excluded.seedance_negative_prompt,
        voiceover_script = excluded.voiceover_script,
        music_prompt = excluded.music_prompt,
        storyboard_image_url = excluded.storyboard_image_url,
        final_video_url = excluded.final_video_url,
        updated_at = excluded.updated_at
    `)

    const now = new Date().toISOString()
    stmt.run(
      project.id,
      project.status,
      JSON.stringify(project.source_images || []),
      project.reference_sheet_url || null,
      project.metadata?.product_name || null,
      project.metadata?.brand_name || null,
      project.metadata?.platform || null,
      project.metadata?.aspect_ratio || null,
      project.metadata?.duration || 10,
      project.metadata?.vibe || null,
      project.metadata?.creative_direction || null,
      project.outputs?.storyboard_visual_prompt || null,
      project.outputs?.seedance_video_prompt || null,
      project.outputs?.seedance_negative_prompt || null,
      project.outputs?.voiceover_script || null,
      project.outputs?.music_prompt || null,
      project.outputs?.storyboard_image_url || null,
      project.outputs?.final_video_url || null,
      project.created_at || now,
      now
    )
  }

  private parseAdProjectRow(row: any): any {
    return {
      id: row.id,
      status: row.status,
      source_images: JSON.parse(row.source_images || '[]'),
      reference_sheet_url: row.reference_sheet_url,
      metadata: {
        product_name: row.product_name,
        brand_name: row.brand_name,
        platform: row.platform,
        aspect_ratio: row.aspect_ratio,
        duration: row.duration,
        vibe: row.vibe,
        creative_direction: row.creative_direction
      },
      outputs: {
        storyboard_visual_prompt: row.storyboard_visual_prompt,
        seedance_video_prompt: row.seedance_video_prompt,
        seedance_negative_prompt: row.seedance_negative_prompt,
        voiceover_script: row.voiceover_script,
        music_prompt: row.music_prompt,
        storyboard_image_url: row.storyboard_image_url,
        final_video_url: row.final_video_url
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }
}

export const dbService = new DatabaseService()
