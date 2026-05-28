import React, { useEffect, useState } from 'react';
import { useAdsMaker } from './hooks/useAdsMaker';
import { PhaseNav } from './components/PhaseNav';
import { Phase1_ProductUpload } from './components/Phase1_ProductUpload';
import { Phase2_Storyboard } from './components/Phase2_Storyboard';
import { Phase3_VideoGen } from './components/Phase3_VideoGen';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export function AdMakerScreen(): React.ReactElement {
  const {
    project,
    phase,
    isLoading,
    loadingMessage,
    error,
    hasUnfinishedJob,
    storyboardQuality,
    setStoryboardQuality,
    setPhase,
    createNewProject,
    loadProject,
    checkUnfinishedJobs,
    generateReferenceSheet,
    detectProductInfo,
    generateStoryboard,
    generateVideo,
    openInAudioLab,
    updateProject
  } = useAdsMaker();

  // Track if this is a regeneration (use GPT Image 2 on regenerate)
  const [isRegeneration, setIsRegeneration] = useState(false);

  // Check for unfinished jobs on mount
  useEffect(() => {
    checkUnfinishedJobs();
  }, [checkUnfinishedJobs]);

  // DEBUG: Log project state changes
  useEffect(() => {
    console.log('[AdMaker] Project updated - ID:', project.id);
    console.log('[AdMaker] Project updated - reference_sheet_url:', project.reference_sheet_url);
    console.log('[AdMaker] Project updated - source_images count:', project.source_images?.length);
  }, [project.id, project.reference_sheet_url, project.source_images]);

  const handleSkipWithStoryboard = (storyboardDataUrl: string) => {
    updateProject({
      outputs: { ...project.outputs, storyboard_image_url: storyboardDataUrl },
      phase: 2,
      status: 'storyboard_generated'
    });
    setPhase(2);
  };

  const handlePhase1Approve = async () => {
    if (project.reference_sheet_url) {
      const { productName, brandName } = await detectProductInfo(project.reference_sheet_url);
      updateProject({
        metadata: {
          ...project.metadata,
          product_name: productName || project.metadata.product_name,
          brand_name: brandName || project.metadata.brand_name
        }
      });
      setPhase(2);
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        background: 'var(--ma-bg)',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '20px' }}>🎬</span>
          </div>
          <div>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#FFF',
                margin: 0,
                letterSpacing: '-0.5px',
                fontFamily: 'Outfit'
              }}
            >
              Ads Maker
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0 0' }}>
              Create high-converting video commercials from product photos
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={createNewProject}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--ma-elevated)',
              border: '1px solid var(--ma-border)',
              borderRadius: '8px',
              color: 'var(--ma-text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} /> New Ad
          </button>
          {hasUnfinishedJob && (
            <button
              onClick={async () => {
                const jobId = await checkUnfinishedJobs();
                if (jobId) await loadProject(jobId);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                color: '#F59E0B',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={14} /> Resume
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#EF4444',
            fontSize: '13px'
          }}
        >
          {error}
        </div>
      )}

      {/* Phase Navigator */}
      <PhaseNav current={phase} onChange={setPhase} />

      {/* Phase Content */}
      {phase === 1 && (
        <Phase1_ProductUpload
          images={project.source_images}
          referenceSheetUrl={project.reference_sheet_url}
          isGenerating={isLoading}
          loadingMessage={loadingMessage}
          onImagesChange={(imgs) => updateProject({ source_images: imgs })}
          onGenerate={() => {
            generateReferenceSheet(project.source_images, isRegeneration, storyboardQuality);
            setIsRegeneration(false); // Reset after generation
          }}
          onApprove={handlePhase1Approve}
          onRegenerate={() => {
            // Clear in-memory only - don't persist null to DB so resume still works
            updateProject({ reference_sheet_url: null, status: 'draft' });
            setIsRegeneration(true);
          }}
          onSkipWithStoryboard={handleSkipWithStoryboard}
        />
      )}

      {phase === 2 && (
        <Phase2_Storyboard
          project={project}
          isGenerating={isLoading}
          loadingMessage={loadingMessage}
          storyboardQuality={storyboardQuality}
          onGenerate={generateStoryboard}
          onApprove={() => setPhase(3)}
          onOpenAudioLab={openInAudioLab}
          onUpdateProject={updateProject}
          onStoryboardQualityChange={setStoryboardQuality}
        />
      )}

      {phase === 3 && (
        <Phase3_VideoGen
          project={project}
          isGenerating={isLoading}
          loadingMessage={loadingMessage}
          onGenerate={generateVideo}
          onOpenAudioLab={openInAudioLab}
        />
      )}
    </div>
  );
}
