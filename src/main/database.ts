import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

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
      `);
    } catch (err) {
      console.error('Database core init failed:', err);
    }

    // --- MIGRATIONS ---
    const migrations = [
      'ALTER TABLE generated_videos ADD COLUMN resolution TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN url TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN file_name TEXT;',
      'ALTER TABLE generated_videos ADD COLUMN file_size INTEGER;',
      'ALTER TABLE generated_videos ADD COLUMN created_at TEXT;'
    ];

    for (const sql of migrations) {
      try {
        this.db.exec(sql);
      } catch (err: any) {
        // Ignore "duplicate column name" errors
        if (!err.message.includes('duplicate column name')) {
          console.error('Migration failed:', sql, err);
        }
      }
    }
  }

  // --- Settings ---
  getSettings() {
    return this.db.prepare('SELECT * FROM app_settings WHERE id = 1').get()
  }

  updateSettings(settings: any) {
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
  getAllCampaigns() {
    return this.db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all()
  }

  createCampaign(name: string, platforms: string) {
    const now = new Date().toISOString()
    const stmt = this.db.prepare(`
      INSERT INTO campaigns (name, platforms, status, created_at, updated_at)
      VALUES (?, ?, 'Draft', ?, ?)
    `)
    const result = stmt.run(name, platforms, now, now)
    return result.lastInsertRowid
  }

  // --- Content Saving ---
  saveImage(img: any) {
    const stmt = this.db.prepare(`
      INSERT INTO generated_images
        (campaign_id, local_path, prompt, model, format, width, height, fal_request_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      img.campaign_id, img.local_path, img.prompt, img.model,
      img.format, img.width, img.height, img.fal_request_id, new Date().toISOString()
    ).lastInsertRowid
  }

  saveCopyVariant(v: any) {
    const stmt = this.db.prepare(`
      INSERT INTO copy_variants
        (campaign_id, variant_type, platform, headline1, headline2, headline3,
         hook, body_copy, cta, tone, triggers_used, landing_page_part, video_scripts, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      v.campaign_id, v.variant_type, v.platform, v.headline1, v.headline2, v.headline3,
      v.hook, v.body_copy, v.cta, v.tone, v.triggers_used, v.landing_page_part, v.video_scripts, new Date().toISOString()
    ).lastInsertRowid
  }

  saveGeneratedVideo(video: any) {
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
  saveCustomVoice(voice: { name: string; embeddingPath: string; samplePath?: string }) {
    const stmt = this.db.prepare(`
      INSERT INTO custom_voices (name, embedding_path, sample_path, created_at)
      VALUES (?, ?, ?, ?)
    `)
    const result = stmt.run(voice.name, voice.embeddingPath, voice.samplePath || null, new Date().toISOString())
    return result.lastInsertRowid
  }

  getAllCustomVoices() {
    return this.db.prepare('SELECT * FROM custom_voices ORDER BY created_at DESC').all()
  }

  deleteCustomVoice(id: number) {
    return this.db.prepare('DELETE FROM custom_voices WHERE id = ?').run(id)
  }
}

export const dbService = new DatabaseService()
