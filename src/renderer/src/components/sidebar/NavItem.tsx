import { ChevronRight } from 'lucide-react';

interface NavItemProps {
  item: {
    id: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    children?: { id: string; label: string; path: string; icon: React.ReactNode }[];
    badge?: string;
  };
  collapsed: boolean;
  isActive: (path?: string) => boolean;
  isParentActive: (item: any) => boolean;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onNavigate: (path: string) => void;
}

export const NavItem = ({
  item,
  collapsed,
  isActive,
  isParentActive,
  isExpanded,
  onToggle,
  onNavigate
}: NavItemProps) => {
  const active = isActive(item.path) || isParentActive(item);

  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => item.children ? onToggle(item.id) : item.path && onNavigate(item.path)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 12px',
          background: active ? 'rgba(108,99,255,0.08)' : 'transparent',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          color: active ? '#FFF' : 'rgba(255,255,255,0.45)',
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          transition: 'all 0.15s',
          justifyContent: collapsed ? 'center' : 'flex-start',
          position: 'relative',
        }}
      >
        <span style={{ color: active ? 'var(--ma-accent-light)' : 'inherit', flexShrink: 0 }}>
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            {item.children && (
              <ChevronRight
                size={14}
                style={{
                  opacity: 0.3,
                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            )}
            {item.badge && (
              <span style={{
                fontSize: 9, background: 'var(--ma-accent)', color: 'white',
                padding: '2px 6px', borderRadius: 10,
              }}>
                {item.badge}
              </span>
            )}
          </>
        )}
        {active && collapsed && (
          <div style={{
            position: 'absolute', left: 0, top: '20%', bottom: '20%',
            width: 3, background: 'var(--ma-accent)', borderRadius: '0 4px 4px 0'
          }} />
        )}
      </button>

      {item.children && isExpanded && !collapsed && (
        <div style={{ marginTop: 2, marginLeft: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {item.children.map(child => (
            <button
              key={child.id}
              onClick={() => onNavigate(child.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 12px', background: 'transparent', border: 'none',
                borderRadius: 6, cursor: 'pointer',
                color: isActive(child.path) ? '#FFF' : 'rgba(255,255,255,0.3)',
                fontSize: 12, textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <span style={{ color: isActive(child.path) ? 'var(--ma-accent-light)' : 'inherit' }}>
                {child.icon}
              </span>
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
