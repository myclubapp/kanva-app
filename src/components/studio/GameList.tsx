import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonCheckbox,
  IonButton,
  IonNote,
  IonText,
} from '@ionic/react';
import { calendar, time, checkmarkCircle } from 'ionicons/icons';

type SportType = 'unihockey' | 'volleyball' | 'handball';

interface Game {
  id: string;
  result: string;
  date: string;
  time: string;
  teamHome: string;
  teamAway: string;
  location?: string;
  city?: string | null;
  teamHomeLogo?: string;
  teamAwayLogo?: string;
  resultDetail?: string | null;
}

interface GameListProps {
  sportType: SportType;
  teamId: string;
  clubId?: string;
  onGameSelect: (gameIds: string[], hasResults: boolean[], games?: Game[]) => void;
  initialSelectedGameIds?: string[];
}

const SPORT_API_URLS: Record<SportType, (teamId: string, clubId?: string) => string> = {
  unihockey: (teamId) => `https://europe-west6-myclubmanagement.cloudfunctions.net/api/swissunihockey?query=%7B%0A%20%20games(teamId%3A%20%22${teamId}%22)%20%7B%0A%20%20%20%20id%0A%20%20%20%20result%0A%20%20%20%20date%0A%20%20%20%20time%0A%20%20%20%20teamHome%0A%20%20%20%20teamAway%0A%20%20%7D%0A%7D%0A`,
  volleyball: (teamId) => `https://europe-west6-myclubmanagement.cloudfunctions.net/api/swissvolley?query=%7B%0A%20%20games(teamId%3A%20%22${teamId}%22)%20%7B%0A%20%20%20%20id%0A%20%20%20%20date%0A%20%20%20%20time%0A%20%20%20%20location%0A%20%20%20%20city%0A%20%20%20%20teamHome%0A%20%20%20%20teamAway%0A%20%20%20%20teamHomeLogo%0A%20%20%20%20teamAwayLogo%0A%20%20%20%20result%0A%20%20%20%20resultDetail%0A%20%20%7D%0A%7D%0A`,
  handball: (teamId, clubId) => `https://europe-west6-myclubmanagement.cloudfunctions.net/api/swisshandball?query=%7B%0A%20%20games(teamId%3A%20%22${teamId}%22%2C%20clubId%3A%20%22${clubId}%22)%20%7B%0A%20%20%20%20id%0A%20%20%20%20teamHome%0A%20%20%20%20teamAway%0A%20%20%20%20teamHomeLogo%0A%20%20%20%20teamAwayLogo%0A%20%20%20%20date%0A%20%20%20%20time%0A%20%20%20%20result%0A%20%20%20%20resultDetail%0A%20%20%7D%0A%7D%0A`
};

export const GameList: React.FC<GameListProps> = ({
  sportType,
  teamId,
  clubId,
  onGameSelect,
  initialSelectedGameIds = []
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(initialSelectedGameIds);
  const [showPastGames, setShowPastGames] = useState(false);
  const maxGamesPerTemplate: number = 3; // Can be adjusted based on subscription

  // Group games by date
  const groupedGames = games.reduce((acc, game) => {
    if (!acc[game.date]) {
      acc[game.date] = [];
    }
    acc[game.date].push(game);
    return acc;
  }, {} as Record<string, Game[]>);

  const handleGameToggle = (gameId: string) => {
    setSelectedGameIds((prev) => {
      if (prev.includes(gameId)) {
        return prev.filter((id) => id !== gameId);
      } else {
        if (prev.length >= maxGamesPerTemplate) {
          return prev;
        }
        return [...prev, gameId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedGameIds.length === 0) {
      return;
    }

    const hasResults = selectedGameIds.map(id => {
      const game = games.find(g => g.id === id);
      return !!(game?.result && game.result !== '' && game.result !== '-:-');
    });

    onGameSelect(selectedGameIds, hasResults, games);
  };

  useEffect(() => {
    if (games.length > 0 && initialSelectedGameIds.length > 0) {
      setSelectedGameIds(initialSelectedGameIds);
    }
  }, [games.length, initialSelectedGameIds]);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const apiUrl = SPORT_API_URLS[sportType](teamId, clubId);
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error('Fehler beim Laden der Spiele');

        const result = await response.json();
        const data: Game[] = result.data?.games || [];

        const parseDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split('.');
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pastGames: Game[] = [];
        const todayGames: Game[] = [];
        const futureGames: Game[] = [];

        data.forEach(game => {
          const gameDate = parseDate(game.date);
          gameDate.setHours(0, 0, 0, 0);

          if (gameDate < today) {
            pastGames.push(game);
          } else if (gameDate.getTime() === today.getTime()) {
            todayGames.push(game);
          } else {
            futureGames.push(game);
          }
        });

        pastGames.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
        todayGames.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
        futureGames.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

        const sortedGames = showPastGames
          ? [...pastGames, ...todayGames, ...futureGames]
          : [...todayGames, ...futureGames];

        setGames(sortedGames);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [sportType, teamId, clubId, showPastGames]);

  if (loading) {
    return (
      <IonCard>
        <IonCardContent>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonCardContent>
      </IonCard>
    );
  }

  if (games.length === 0) {
    return (
      <IonCard>
        <IonCardContent>
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--ion-color-medium)' }}>
            <p>Keine Spiele für dieses Team gefunden</p>
          </div>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Verfügbare Spiele</IonCardTitle>
          <IonCardSubtitle>
            Wähle bis zu {maxGamesPerTemplate} {maxGamesPerTemplate === 1 ? 'Spiel' : 'Spiele'} vom gleichen Tag aus
          </IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonItem lines="none" style={{ marginBottom: '1rem', '--background': 'var(--ion-color-light)' }}>
            <IonCheckbox
              checked={showPastGames}
              onIonChange={(e) => setShowPastGames(e.detail.checked)}
              slot="start"
            />
            <IonLabel>Vergangene Spiele anzeigen</IonLabel>
          </IonItem>

          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {Object.entries(groupedGames).map(([date, gamesOnDate]) => {
              const hasMultipleGames = gamesOnDate.length > 1;

              return (
                <div
                  key={date}
                  style={{
                    marginBottom: '1rem',
                    border: hasMultipleGames ? '2px solid var(--ion-color-primary-tint)' : 'none',
                    borderRadius: '8px',
                    padding: hasMultipleGames ? '0.5rem' : '0',
                    background: hasMultipleGames ? 'rgba(var(--ion-color-primary-rgb), 0.05)' : 'transparent'
                  }}
                >
                  {hasMultipleGames && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                      <IonIcon icon={calendar} color="primary" />
                      <IonText color="primary">
                        <strong>{date} - {gamesOnDate.length} Spiele</strong>
                      </IonText>
                    </div>
                  )}

                  <IonList style={{ background: 'transparent' }}>
                    {gamesOnDate.map((game) => {
                      const isSelected = selectedGameIds.includes(game.id);

                      return (
                        <IonItem
                          key={game.id}
                          button
                          onClick={() => handleGameToggle(game.id)}
                          style={{
                            '--background': isSelected ? 'rgba(var(--ion-color-primary-rgb), 0.1)' : 'var(--ion-card-background)',
                            marginBottom: '0.5rem',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid var(--ion-color-primary)' : '1px solid var(--ion-color-light)'
                          }}
                        >
                          <IonCheckbox
                            checked={isSelected}
                            slot="start"
                          />
                          <IonLabel>
                            <h3 style={{ fontWeight: 600 }}>
                              {game.teamHome} <span style={{ color: 'var(--ion-color-medium)' }}>vs</span> {game.teamAway}
                            </h3>
                            {game.result && game.result !== '-:-' && game.result !== '' && (
                              <p style={{ color: 'var(--ion-color-primary)', fontWeight: 500 }}>
                                Resultat: {game.result}
                              </p>
                            )}
                            <p style={{ fontSize: '0.875rem', color: 'var(--ion-color-medium)' }}>
                              <IonIcon icon={calendar} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                              {game.date}
                              <span style={{ margin: '0 0.5rem' }}>•</span>
                              <IonIcon icon={time} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                              {game.time}
                            </p>
                          </IonLabel>
                        </IonItem>
                      );
                    })}
                  </IonList>
                </div>
              );
            })}
          </div>
        </IonCardContent>
      </IonCard>

      {/* Continue Button */}
      {selectedGameIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '1rem',
          background: 'var(--ion-background-color)',
          borderTop: '1px solid var(--ion-border-color)',
          zIndex: 1000
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IonText>
              <strong>{selectedGameIds.length} Spiel{selectedGameIds.length > 1 ? 'e' : ''} ausgewählt</strong>
            </IonText>
            <IonButton onClick={handleContinue}>
              Weiter
            </IonButton>
          </div>
        </div>
      )}
    </>
  );
};
