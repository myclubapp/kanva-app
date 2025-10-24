import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonItem,
  IonText,
} from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ClubSearch } from '../components/studio/ClubSearch';
import { TeamSearch } from '../components/studio/TeamSearch';
import { GameList } from '../components/studio/GameList';
import { GamePreview } from '../components/studio/GamePreview';
import './Studio.css';

type SportType = 'unihockey' | 'volleyball' | 'handball' | '';

const Studio: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<SportType>('');
  const [selectedClubId, setSelectedClubId] = useState('');
  const [selectedClubName, setSelectedClubName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [gamesHaveResults, setGamesHaveResults] = useState<boolean[]>([]);
  const { user } = useAuth();
  const { t } = useLanguage();

  const sportLabels: Record<Exclude<SportType, ''>, string> = {
    unihockey: 'Unihockey',
    volleyball: 'Volleyball',
    handball: 'Handball'
  };

  const handleSportChange = (sport: SportType) => {
    setSelectedSport(sport);
    setSelectedClubId('');
    setSelectedClubName('');
    setSelectedTeamId('');
    setSelectedTeamName('');
    setSelectedGameIds([]);
  };

  const handleClubSelect = (clubId: string, clubName: string) => {
    setSelectedClubId(clubId);
    setSelectedClubName(clubName);
    setSelectedTeamId('');
    setSelectedTeamName('');
    setSelectedGameIds([]);
  };

  const handleTeamSelect = (teamId: string, teamName: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
    setSelectedGameIds([]);
  };

  const handleGameSelect = (gameIds: string[], hasResults: boolean[], games?: any[]) => {
    setSelectedGameIds(gameIds);
    setGamesHaveResults(hasResults);
  };

  const handleBackToSportSelection = () => {
    setSelectedSport('');
    setSelectedClubId('');
    setSelectedClubName('');
    setSelectedTeamId('');
    setSelectedTeamName('');
    setSelectedGameIds([]);
  };

  const handleBackToClubSelection = () => {
    setSelectedClubId('');
    setSelectedClubName('');
    setSelectedTeamId('');
    setSelectedTeamName('');
    setSelectedGameIds([]);
  };

  const handleBackToTeamSelection = () => {
    setSelectedTeamId('');
    setSelectedTeamName('');
    setSelectedGameIds([]);
  };

  const handleBackToGameSelection = () => {
    setSelectedGameIds([]);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>
            {!selectedSport && t.studio.title}
            {selectedSport && !selectedClubId && `${sportLabels[selectedSport]} - ${t.studio.selectClub}`}
            {selectedClubId && !selectedTeamId && `${selectedClubName} - ${t.studio.selectTeam}`}
            {selectedTeamId && `${selectedClubName} - ${selectedTeamName}`}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="studio-content">
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {/* Step 1: Sport Selection */}
          {!selectedSport && (
            <>
              <IonText>
                <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  {t.studio.subtitle}
                </p>
              </IonText>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--ion-color-primary)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>1</span>
                      {t.studio.selectSport}
                    </div>
                  </IonCardTitle>
                  <IonCardSubtitle>{t.studio.selectSportDescription}</IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel>{t.studio.selectSport}</IonLabel>
                    <IonSelect
                      value={selectedSport}
                      placeholder={t.studio.selectSportPlaceholder}
                      onIonChange={(e) => handleSportChange(e.detail.value)}
                    >
                      <IonSelectOption value="unihockey">Unihockey</IonSelectOption>
                      <IonSelectOption value="volleyball">Volleyball</IonSelectOption>
                      <IonSelectOption value="handball">Handball</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                </IonCardContent>
              </IonCard>
            </>
          )}

          {/* Step 2: Club Selection */}
          {selectedSport && !selectedClubId && (
            <>
              <IonButton
                fill="clear"
                size="small"
                onClick={handleBackToSportSelection}
                style={{ marginBottom: '1rem' }}
              >
                <IonIcon icon={chevronBack} slot="start" />
                {t.studio.back}
              </IonButton>

              <div style={{ marginBottom: '1rem' }}>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--ion-color-primary)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>2</span>
                        {t.studio.selectClub}
                      </div>
                    </IonCardTitle>
                    <IonCardSubtitle>{t.studio.selectClubDescription}</IonCardSubtitle>
                  </IonCardHeader>
                </IonCard>
              </div>

              <ClubSearch
                sportType={selectedSport as Exclude<SportType, ''>}
                onClubSelect={handleClubSelect}
              />
            </>
          )}

          {/* Step 3: Team Selection */}
          {selectedSport && selectedClubId && !selectedTeamId && (
            <>
              <IonButton
                fill="clear"
                size="small"
                onClick={handleBackToClubSelection}
                style={{ marginBottom: '1rem' }}
              >
                <IonIcon icon={chevronBack} slot="start" />
                {t.studio.back}
              </IonButton>

              <div style={{ marginBottom: '1rem' }}>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--ion-color-primary)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>3</span>
                        {t.studio.selectTeam}
                      </div>
                    </IonCardTitle>
                    <IonCardSubtitle>{t.studio.selectTeamDescription}</IonCardSubtitle>
                  </IonCardHeader>
                </IonCard>
              </div>

              <TeamSearch
                sportType={selectedSport as Exclude<SportType, ''>}
                clubId={selectedClubId}
                clubName={selectedClubName}
                onTeamSelect={handleTeamSelect}
              />
            </>
          )}

          {/* Step 4: Game Selection */}
          {selectedSport && selectedClubId && selectedTeamId && selectedGameIds.length === 0 && (
            <>
              <IonButton
                fill="clear"
                size="small"
                onClick={handleBackToTeamSelection}
                style={{ marginBottom: '1rem' }}
              >
                <IonIcon icon={chevronBack} slot="start" />
                {t.studio.back}
              </IonButton>

              <div style={{ marginBottom: '1rem' }}>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--ion-color-primary)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>4</span>
                        {t.studio.selectGame}
                      </div>
                    </IonCardTitle>
                    <IonCardSubtitle>{t.studio.selectGameDescription}</IonCardSubtitle>
                  </IonCardHeader>
                </IonCard>
              </div>

              <GameList
                sportType={selectedSport as Exclude<SportType, ''>}
                teamId={selectedTeamId}
                clubId={selectedClubId}
                onGameSelect={handleGameSelect}
              />
            </>
          )}

          {/* Step 5: Games Selected - Preview */}
          {selectedSport && selectedClubId && selectedTeamId && selectedGameIds.length > 0 && (
            <>
              <IonButton
                fill="clear"
                size="small"
                onClick={handleBackToGameSelection}
                style={{ marginBottom: '1rem' }}
              >
                <IonIcon icon={chevronBack} slot="start" />
                {t.studio.backToGameSelection}
              </IonButton>

              <GamePreview
                sportType={selectedSport as Exclude<SportType, ''>}
                clubId={selectedClubId}
                teamId={selectedTeamId}
                gameIds={selectedGameIds}
                gamesHaveResults={gamesHaveResults}
              />
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Studio;
