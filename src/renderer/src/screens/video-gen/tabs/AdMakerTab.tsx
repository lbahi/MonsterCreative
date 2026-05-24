/**
 * Ad Maker Tab — Orchestrates the 3-phase wizard.
 * State persistence via IPC → SQLite ad_projects table.
 */
import React, { useState, useCallback, useEffect } from 'react'
import { Phase1Upload } from '../wizard/Phase1Upload'
import { Phase2Settings } from '../wizard/Phase2Settings'
import { Phase3Video } from '../wizard/Phase3Video'

type WizardPhase = 1 | 2 | 3

interface AdProject {
  id: string
  status: string
  source_images: string[]
  reference_sheet_url: string | null
  metadata: {
    product_name: string | null
    brand_name: string | null
    platform: string | null
    aspect_ratio: string | null
    duration: number
    vibe: string | null
    creative_direction: string | null
  }
  outputs: {
    storyboard_visual_prompt: string | null
    seedance_video_prompt: string | null
    seedance_negative_prompt: string | null
    voiceover_script: string | null
    music_prompt: string | null
    storyboard_image_url: string | null
    final_video_url: string | null
  }
}

function generateId(): string {
  return `adp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function AdMakerTab(): React.ReactElement {
  const [phase, setPhase] = useState<WizardPhase>(1)
  const [project, setProject] = useState<AdProject>({
    id: generateId(),
    status: 'draft',
    source_images: [],
    reference_sheet_url: null,
    metadata: {
      product_name: null,
      brand_name: null,
      platform: null,
      aspect_ratio: null,
      duration: 10,
      vibe: null,
      creative_direction: null
    },
    outputs: {
      storyboard_visual_prompt: null,
      seedance_video_prompt: null,
      seedance_negative_prompt: null,
      voiceover_script: null,
      music_prompt: null,
      storyboard_image_url: null,
      final_video_url: null
    }
  })

  // Persist to DB whenever project changes
  const persistProject = useCallback(
    async (updated: AdProject) => {
      try {
        await window.api.database.saveAdProject(updated)
      } catch (err) {
        console.error('[AdMaker] Failed to persist project:', err)
      }
    },
    []
  )

  // Phase 1 → Phase 2
  const handlePhase1Approve = useCallback(
    (params: { sourceImageUrls: string[]; referenceSheetUrl: string }) => {
      const updated: AdProject = {
        ...project,
        status: 'phase1_approved',
        source_images: params.sourceImageUrls,
        reference_sheet_url: params.referenceSheetUrl
      }
      setProject(updated)
      persistProject(updated)
      setPhase(2)
    },
    [project, persistProject]
  )

  // Phase 2 → Phase 3
  const handlePhase2Approve = useCallback(
    (params: {
      platform: string
      aspectRatio: string
      duration: number
      vibe: string
      creativeDirection: string
      productName: string
      brandName: string
      storyboardVisualPrompt: string
      seedanceVideoPrompt: string
      seedanceNegativePrompt: string
      voiceoverScript: string
      musicPrompt: string
      storyboardImageUrl: string
    }) => {
      const updated: AdProject = {
        ...project,
        status: 'phase2_approved',
        metadata: {
          product_name: params.productName || null,
          brand_name: params.brandName || null,
          platform: params.platform,
          aspect_ratio: params.aspectRatio,
          duration: params.duration,
          vibe: params.vibe,
          creative_direction: params.creativeDirection || null
        },
        outputs: {
          ...project.outputs,
          storyboard_visual_prompt: params.storyboardVisualPrompt,
          seedance_video_prompt: params.seedanceVideoPrompt,
          seedance_negative_prompt: params.seedanceNegativePrompt,
          voiceover_script: params.voiceoverScript,
          music_prompt: params.musicPrompt,
          storyboard_image_url: params.storyboardImageUrl,
          final_video_url: null
        }
      }
      setProject(updated)
      persistProject(updated)
      setPhase(3)
    },
    [project, persistProject]
  )

  // Phase 3 complete
  const handleVideoComplete = useCallback(
    (videoUrl: string) => {
      const updated: AdProject = {
        ...project,
        status: 'completed',
        outputs: { ...project.outputs, final_video_url: videoUrl }
      }
      setProject(updated)
      persistProject(updated)
    },
    [project, persistProject]
  )

  // Reset to start a new project
  const handleReset = () => {
    setPhase(1)
    setProject({
      id: generateId(),
      status: 'draft',
      source_images: [],
      reference_sheet_url: null,
      metadata: {
        product_name: null,
        brand_name: null,
        platform: null,
        aspect_ratio: null,
        duration: 10,
        vibe: null,
        creative_direction: null
      },
      outputs: {
        storyboard_visual_prompt: null,
        seedance_video_prompt: null,
        seedance_negative_prompt: null,
        voiceover_script: null,
        music_prompt: null,
        storyboard_image_url: null,
        final_video_url: null
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Phase Progress Stepper */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          padding: '16px 20px',
          background: 'var(--ma-elevated)',
          borderRadius: 14,
          border: '1px solid var(--ma-border)'
        }}
      >
        {[
          { num: 1, label: 'Product', desc: 'Upload & Reference' },
          { num: 2, label: 'Settings', desc: 'Storyboard & Config' },
          { num: 3, label: 'Video', desc: 'Generate & Download' }
        ].map((step, i) => {
          const isActive = phase === step.num
          const isCompleted = phase > step.num
          return (
            <React.Fragment key={step.num}>
              {i > 0 && (
                <div
                  style={{
                    flex: '0 0 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 2,
                      borderRadius: 1,
                      background: isCompleted
                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                        : 'rgba(255,255,255,0.1)'
                    }}
                  />
                </div>
              )}
              <div
                onClick={() => {
                  if (isCompleted) setPhase(step.num as WizardPhase)
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: isActive
                    ? 'rgba(108,99,255,0.12)'
                    : isCompleted
                      ? 'rgba(34,197,94,0.06)'
                      : 'transparent',
                  cursor: isCompleted ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isCompleted
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : isActive
                        ? 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)'
                        : 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    color: isCompleted || isActive ? '#FFF' : 'rgba(255,255,255,0.3)',
                    flexShrink: 0,
                    boxShadow: isActive
                      ? '0 0 12px rgba(108,99,255,0.4)'
                      : isCompleted
                        ? '0 0 8px rgba(34,197,94,0.3)'
                        : 'none'
                  }}
                >
                  {isCompleted ? '✓' : step.num}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isActive || isCompleted ? '#FFF' : 'rgba(255,255,255,0.4)'
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: isActive ? 'rgba(108,99,255,0.8)' : 'rgba(255,255,255,0.3)'
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>

      {/* Phase Content */}
      {phase === 1 && <Phase1Upload onApprove={handlePhase1Approve} />}

      {phase === 2 && project.reference_sheet_url && (
        <Phase2Settings
          referenceSheetUrl={project.reference_sheet_url}
          onApprove={handlePhase2Approve}
        />
      )}

      {phase === 3 &&
        project.outputs.storyboard_image_url &&
        project.outputs.seedance_video_prompt && (
          <Phase3Video
            storyboardImageUrl={project.outputs.storyboard_image_url}
            seedanceVideoPrompt={project.outputs.seedance_video_prompt}
            seedanceNegativePrompt={project.outputs.seedance_negative_prompt || ''}
            voiceoverScript={project.outputs.voiceover_script || ''}
            musicPrompt={project.outputs.music_prompt || ''}
            aspectRatio={project.metadata.aspect_ratio || '9:16'}
            duration={project.metadata.duration}
            onComplete={handleVideoComplete}
          />
        )}

      {/* New Project (visible after completion) */}
      {project.status === 'completed' && (
        <button
          onClick={handleReset}
          style={{
            marginTop: 16,
            padding: '12px',
            borderRadius: 10,
            border: '1px solid var(--ma-border)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          + Start New Ad Project
        </button>
      )}
    </div>
  )
}
