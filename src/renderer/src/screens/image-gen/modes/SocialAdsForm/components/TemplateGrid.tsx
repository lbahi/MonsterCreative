import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SOCIAL_TEMPLATES } from '../data/social-templates';
import type { Template } from '../types';

type Props = {
  selectedTemplate: Template | null;
  selectedRatio: string;
  selectedResolution: string;
  selectedLanguage: string;
  onPreviewTemplate: (template: Template) => void;
};

export const TemplateGrid = ({
  selectedTemplate,
  selectedRatio,
  selectedResolution,
  selectedLanguage,
  onPreviewTemplate
}: Props) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  const uniqueCategories = Array.from(new Set(SOCIAL_TEMPLATES.map(t => t.category))).sort();
  const categories = ['All', ...uniqueCategories];

  const filteredTemplates = selectedCategoryFilter === 'All' 
    ? SOCIAL_TEMPLATES 
    : SOCIAL_TEMPLATES.filter(t => t.category === selectedCategoryFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={14} color="var(--ma-accent)" />
            6 · Select Template
          </h3>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0 0' }}>
            Click a style to use its prompt with your product image.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryFilter(cat)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: `1px solid ${selectedCategoryFilter === cat ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
              background: selectedCategoryFilter === cat ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.02)',
              color: selectedCategoryFilter === cat ? '#FFF' : 'rgba(255,255,255,0.6)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: 12,
        overflowY: 'auto',
        maxHeight: 7000,
        paddingRight: 4,
      }}>
        {filteredTemplates.map(t => {
          const isSelected = selectedTemplate?.id === t.id;
          const catColors: Record<string, string> = {
            'Skincare': '#F472B6', 'Beauty': '#EC4899', 'Serums & Oils': '#DB2777',
            'Haircare': '#A855F7', 'Spa & Wellness': '#8B5CF6', 'Fragrance': '#C084FC',
            'Fashion': '#A78BFA', 'Luxury Fashion': '#7C3AED', 'Winter Fashion': '#6366F1',
            'Textiles': '#818CF8', 'Jewelry': '#F59E0B', 'Footwear': '#F97316',
            'Home & Décor': '#8B5CF6', 'Furniture': '#6D28D9',
            'Food & Beverage': '#10B981', 'Food & Condiments': '#34D399', 'Fast Food': '#F97316',
            'Beverage': '#14B8A6', 'Fitness & Supplements': '#22D3EE',
            'Outdoor & Sports': '#06B6D4', 'Suncare': '#FBBF24',
            'Tech & Gadgets': '#3B82F6', 'Tech & SaaS': '#2563EB', 'Gaming': '#EF4444',
            'E-Commerce': '#6B7280', 'Packaging': '#9CA3AF',
            'CGI & Brand': '#EF4444', 'Festive': '#F97316', 'Urban & Retail': '#64748B',
            'Launch & Bold': '#DC2626', 'Art & Print': '#D946EF', 'Design & Events': '#C026D3',
            'Universal': '#6B7280', 'General': '#6B7280', 'Baby Products': '#FDA4AF',
          };
          const catColor = catColors[t.category] ?? '#6B7280';
          return (
            <button
              key={t.id}
              onClick={() => onPreviewTemplate(t)}
              style={{
                background: 'var(--ma-elevated)',
                border: `1px solid ${isSelected ? '#3B82F6' : 'var(--ma-border)'}`,
                borderRadius: 12,
                padding: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                transition: 'all 0.2s',
                position: 'relative',
                boxShadow: isSelected ? '0 0 0 2px #3B82F6, 0 0 16px rgba(59,130,246,0.3)' : 'none',
              }}
            >
              <div style={{ width: '100%', aspectRatio: '4 / 5', position: 'relative', background: '#000' }}>
                <img
                  src={`/OutputSocialAds/${t.id}.png`}
                  alt={`Template ${t.id}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = t.coverImage; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {isSelected && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    background: '#3B82F6', borderRadius: '50%',
                    width: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.7)',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>

              <div style={{
                padding: '7px 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderTop: '1px solid var(--ma-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: catColor, display: 'inline-block', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: catColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {t.category}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--ma-green, #10B981)' }}>
                  <Sparkles size={9} />
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase' }}>1-Click</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedTemplate && (
        <div style={{
          background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 8, padding: '10px 12px',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>
            Prompt Preview
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.55 }}>
            {selectedTemplate.prompt}
            {' '}
            <span style={{ color: '#F59E0B' }}>
              This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy.
              {' '}Aspect ratio: {selectedRatio}. Resolution: {selectedResolution}.
              {' '}
              {selectedLanguage === 'english'
                ? 'All text in the poster must be written in English.'
                : selectedLanguage === 'arabic'
                  ? 'All text in the poster must be written in Arabic (عربي).'
                  : 'All text in the poster must be written in French (Français).'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
