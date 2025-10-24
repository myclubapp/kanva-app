import React, { useEffect, useRef, useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonItem,
} from '@ionic/react';
import { download, shareSocial } from 'ionicons/icons';

type SportType = 'unihockey' | 'volleyball' | 'handball';

interface GamePreviewProps {
  sportType: SportType;
  clubId: string;
  teamId: string;
  gameIds: string[];
  gamesHaveResults?: boolean[];
}

// Custom web components - TypeScript declarations handled in global.d.ts

const STANDARD_THEMES = [
  { value: 'kanva', label: 'KANVA' },
  { value: 'kanva-light', label: 'KANVA Light' },
  { value: 'kanva-dark', label: 'KANVA Dark' },
];

export const GamePreview: React.FC<GamePreviewProps> = ({
  sportType,
  clubId,
  teamId,
  gameIds,
  gamesHaveResults = []
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'result'>('preview');
  const [selectedTheme, setSelectedTheme] = useState('kanva');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const gameId = gameIds[0];
  const gameId2 = gameIds.length > 1 ? gameIds[1] : undefined;
  const gameId3 = gameIds.length > 2 ? gameIds[2] : undefined;

  // Map sport type to API type
  const apiType = sportType === 'unihockey' ? 'swissunihockey' :
                  sportType === 'volleyball' ? 'swissvolley' :
                  'swisshandball';

  // Auto-switch to Result tab when results become available
  useEffect(() => {
    const hasAnyResult = gamesHaveResults.some(hasResult => hasResult);
    if (hasAnyResult && activeTab === 'preview') {
      setActiveTab('result');
    }
  }, [gamesHaveResults]);

  // Load the web component script
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/kanva-web-components@latest/dist/kanva-web-components/kanva-web-components.esm.js';

    const existingScript = document.querySelector(`script[src="${script.src}"]`);
    if (!existingScript) {
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleDownload = async () => {
    try {
      const targetRef = activeTab === 'preview' ? previewRef : resultRef;
      const componentSelector = activeTab === 'preview' ? 'game-preview' : 'game-result';
      const gameElement = targetRef.current?.querySelector(componentSelector);

      if (!gameElement) {
        console.error('Component not found');
        return;
      }

      // Get the SVG element from the web component
      const svgElement = (gameElement as any).shadowRoot?.querySelector('svg');

      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }

      // Convert SVG to canvas and download
      // This is a simplified version - full implementation would use save-svg-as-png or similar
      console.log('Download functionality - to be implemented with Capacitor');

    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (!scriptLoaded) {
    return (
      <IonCard>
        <IonCardContent>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <IonSpinner name="crescent" />
            <p style={{ marginLeft: '1rem' }}>Lade Preview...</p>
          </div>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Vorschau</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {/* Theme Selection */}
          <IonItem>
            <IonLabel>Vorlage</IonLabel>
            <IonSelect
              value={selectedTheme}
              onIonChange={(e) => setSelectedTheme(e.detail.value)}
            >
              {STANDARD_THEMES.map((theme) => (
                <IonSelectOption key={theme.value} value={theme.value}>
                  {theme.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {/* Tabs */}
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as 'preview' | 'result')}
            style={{ marginTop: '1rem' }}
          >
            <IonSegmentButton value="preview">
              <IonLabel>Vorschau</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="result" disabled={!gamesHaveResults.some(r => r)}>
              <IonLabel>Resultat</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {/* Preview Content */}
          <div style={{ marginTop: '1.5rem' }}>
            {activeTab === 'preview' && (
              <div
                ref={previewRef}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '1rem',
                  background: 'var(--ion-color-light)',
                  borderRadius: '8px'
                }}
              >
                <game-preview
                  key={`${gameId}-${gameId2 || 'single'}-${gameId3 || 'single'}-${selectedTheme}`}
                  type={apiType}
                  game={gameId}
                  {...(gameId2 && { 'game-2': gameId2 })}
                  {...(gameId3 && { 'game-3': gameId3 })}
                  theme={selectedTheme}
                  style={{
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            )}

            {activeTab === 'result' && (
              <div
                ref={resultRef}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '1rem',
                  background: 'var(--ion-color-light)',
                  borderRadius: '8px'
                }}
              >
                <game-result
                  key={`${gameId}-${gameId2 || 'single'}-${gameId3 || 'single'}-${selectedTheme}`}
                  type={apiType}
                  game={gameId}
                  {...(gameId2 && { 'game-2': gameId2 })}
                  {...(gameId3 && { 'game-3': gameId3 })}
                  theme={selectedTheme}
                  style={{
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <IonButton expand="block" onClick={handleDownload}>
              <IonIcon icon={download} slot="start" />
              Herunterladen
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>
    </>
  );
};
