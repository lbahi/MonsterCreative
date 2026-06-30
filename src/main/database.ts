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
    // Force WAL mode off to ensure immediate disk writes
    this.db.pragma('journal_mode = DELETE')
    this.db.pragma('synchronous = FULL')
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
          phase INTEGER DEFAULT 1,
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
          voiceover_audio_url TEXT,
          music_audio_url TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `)
    } catch (err: unknown) {
      console.error('[DB] CRITICAL: Database core init failed:', err instanceof Error ? err.message : String(err))
      throw err
    }

    // Verify tables were created
    try {
      this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    } catch (e) {
      console.error('[DB] Failed to verify tables:', e)
    }

    // --- MIGRATIONS ---
    const migrations = [
      'ALTER TABLE generated_videos ADD COLUMN resolution TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN url TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN file_name TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN file_size INTEGER;',
      'ALTER TABLE generated_videos ADD COLUMN created_at TEXT;',
      // Ad projects migrations
      'ALTER TABLE ad_projects ADD COLUMN reference_sheet_url TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN phase INTEGER DEFAULT 1;',
      'ALTER TABLE ad_projects ADD COLUMN product_name TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN brand_name TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN platform TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN aspect_ratio TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN duration TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN vibe TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN creative_direction TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN storyboard_visual_prompt TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN seedance_video_prompt TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN seedance_negative_prompt TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN voiceover_script TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN music_prompt TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN storyboard_image_url TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN final_video_url TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN voiceover_audio_url TEXT;',
      'ALTER TABLE ad_projects ADD COLUMN music_audio_url TEXT;',
      // Favorites & Tagging migrations
      'ALTER TABLE generated_images ADD COLUMN is_favorite INTEGER DEFAULT 0;',
      'ALTER TABLE generated_images ADD COLUMN tags TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN is_favorite INTEGER DEFAULT 0;',
      'ALTER TABLE generated_videos ADD COLUMN tags TEXT;',
      'ALTER TABLE copy_variants ADD COLUMN is_favorite INTEGER DEFAULT 0;',
      'ALTER TABLE copy_variants ADD COLUMN tags TEXT;',
      'ALTER TABLE custom_voices ADD COLUMN is_favorite INTEGER DEFAULT 0;',
      'ALTER TABLE custom_voices ADD COLUMN tags TEXT;'
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

    // Log ad_projects table schema
    try {
      this.db.prepare("PRAGMA table_info(ad_projects)").all()
    } catch (e) {
      console.error('[DB] Failed to get table info:', e)
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

  getAllGeneratedImages(): any[] {
    return this.db.prepare('SELECT * FROM generated_images ORDER BY created_at DESC').all()
  }

  getAllGeneratedVideos(): any[] {
    return this.db.prepare('SELECT * FROM generated_videos ORDER BY created_at DESC').all()
  }

  getAllCopyVariants(): any[] {
    return this.db.prepare('SELECT * FROM copy_variants ORDER BY created_at DESC').all()
  }

  deleteGeneratedImage(id: number): Database.RunResult {
    return this.db.prepare('DELETE FROM generated_images WHERE id = ?').run(id)
  }

  deleteGeneratedVideo(id: number): Database.RunResult {
    return this.db.prepare('DELETE FROM generated_videos WHERE id = ?').run(id)
  }

  deleteCopyVariant(id: number): Database.RunResult {
    return this.db.prepare('DELETE FROM copy_variants WHERE id = ?').run(id)
  }

  toggleFavorite(type: string, id: number | string, isFavorite: boolean): Database.RunResult {
    const val = isFavorite ? 1 : 0
    let table = ''
    if (type === 'Image') table = 'generated_images'
    else if (type === 'Video') table = 'generated_videos'
    else if (type === 'Copy') table = 'copy_variants'
    else if (type === 'Audio') table = 'custom_voices'
    else if (type === 'Ad Project') table = 'ad_projects'

    if (!table) throw new Error(`Invalid asset type: ${type}`)
    return this.db.prepare(`UPDATE ${table} SET is_favorite = ? WHERE id = ?`).run(val, id)
  }

  updateTags(type: string, id: number | string, tags: string): Database.RunResult {
    let table = ''
    if (type === 'Image') table = 'generated_images'
    else if (type === 'Video') table = 'generated_videos'
    else if (type === 'Copy') table = 'copy_variants'
    else if (type === 'Audio') table = 'custom_voices'
    else if (type === 'Ad Project') table = 'ad_projects'

    if (!table) throw new Error(`Invalid asset type: ${type}`)
    return this.db.prepare(`UPDATE ${table} SET tags = ? WHERE id = ?`).run(tags, id)
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
    const parsed = this.parseAdProjectRow(row)
    return parsed
  }

  getAllAdProjects(): any[] {
    const rows = this.db.prepare('SELECT * FROM ad_projects ORDER BY updated_at DESC').all()
    return rows.map((r) => this.parseAdProjectRow(r))
  }

  saveAdProject(project: any): void {
    const stmt = this.db.prepare(`
      INSERT INTO ad_projects (
        id, status, phase, source_images, reference_sheet_url,
        product_name, brand_name, platform, aspect_ratio, duration, vibe, creative_direction,
        storyboard_visual_prompt, seedance_video_prompt, seedance_negative_prompt,
        voiceover_script, music_prompt, storyboard_image_url, final_video_url,
        voiceover_audio_url, music_audio_url, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        phase = excluded.phase,
        source_images = excluded.source_images,
        reference_sheet_url = COALESCE(excluded.reference_sheet_url, ad_projects.reference_sheet_url),
        product_name = COALESCE(excluded.product_name, ad_projects.product_name),
        brand_name = COALESCE(excluded.brand_name, ad_projects.brand_name),
        platform = COALESCE(excluded.platform, ad_projects.platform),
        aspect_ratio = COALESCE(excluded.aspect_ratio, ad_projects.aspect_ratio),
        duration = excluded.duration,
        vibe = COALESCE(excluded.vibe, ad_projects.vibe),
        creative_direction = COALESCE(excluded.creative_direction, ad_projects.creative_direction),
        storyboard_visual_prompt = COALESCE(excluded.storyboard_visual_prompt, ad_projects.storyboard_visual_prompt),
        seedance_video_prompt = COALESCE(excluded.seedance_video_prompt, ad_projects.seedance_video_prompt),
        seedance_negative_prompt = COALESCE(excluded.seedance_negative_prompt, ad_projects.seedance_negative_prompt),
        voiceover_script = COALESCE(excluded.voiceover_script, ad_projects.voiceover_script),
        music_prompt = COALESCE(excluded.music_prompt, ad_projects.music_prompt),
        storyboard_image_url = COALESCE(excluded.storyboard_image_url, ad_projects.storyboard_image_url),
        final_video_url = COALESCE(excluded.final_video_url, ad_projects.final_video_url),
        voiceover_audio_url = COALESCE(excluded.voiceover_audio_url, ad_projects.voiceover_audio_url),
        music_audio_url = COALESCE(excluded.music_audio_url, ad_projects.music_audio_url),
        updated_at = excluded.updated_at
    `)

    const now = new Date().toISOString()
    stmt.run(
      project.id,
      project.status,
      project.phase || 1,
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
      project.outputs?.voiceover_audio_url || null,
      project.outputs?.music_audio_url || null,
      project.created_at || now,
      now
    )
  }

  private parseAdProjectRow(row: any): any {
    return {
      id: row.id,
      status: row.status,
      phase: row.phase || 1,
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
        final_video_url: row.final_video_url,
        voiceover_audio_url: row.voiceover_audio_url,
        music_audio_url: row.music_audio_url
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }
}

export const dbService = new DatabaseService()
