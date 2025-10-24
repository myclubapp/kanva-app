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
  IonNote,
} from '@ionic/react';
import { people } from 'ionicons/icons';

type SportType = 'unihockey' | 'volleyball' | 'handball';

interface Team {
  id: string;
  name: string;
  liga?: string;
}

interface TeamSearchProps {
  sportType: SportType;
  clubId: string;
  clubName: string;
  onTeamSelect: (teamId: string, teamName: string) => void;
}

const SPORT_API_URLS: Record<SportType, (clubId: string) => string> = {
  unihockey: (clubId) => `https://europe-west6-myclubmanagement.cloudfunctions.net/api/swissunihockey?query=%7B%0A%20%20teams(clubId%3A%20%22${clubId}%22)%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%7D%0A%7D%0A`,
  volleyball: (clubId) => `https://europe-west6-myclubmanagement.cloudfunctions.net/api/swissvolley?query=%7B%0A%20%20teams(clubId%3A%20%22${clubId}%22)%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%20%20liga%0A%20%20%7D%0A%7D%0A`,
  handball: (clubId) => `https://europe-west6-myclubmanagement.cloudfunctions.net/api/swisshandball?query=%7B%0A%20%20teams(clubId%3A%20%22${clubId}%22)%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%20%20liga%0A%20%20%7D%0A%7D%0A`
};

export const TeamSearch: React.FC<TeamSearchProps> = ({
  sportType,
  clubId,
  clubName,
  onTeamSelect
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const apiUrl = SPORT_API_URLS[sportType](clubId);
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error('Fehler beim Laden der Teams');

        const result = await response.json();
        const data: Team[] = result.data?.teams || [];

        const sortedTeams = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setTeams(sortedTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [sportType, clubId]);

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

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Team auswählen</IonCardTitle>
        <IonCardSubtitle>
          {teams.length} Teams verfügbar für {clubName}
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        {teams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--ion-color-medium)' }}>
            <IonIcon icon={people} style={{ fontSize: '3rem', opacity: 0.5 }} />
            <p>Keine Teams verfügbar</p>
          </div>
        ) : (
          <IonList style={{ maxHeight: '400px', overflow: 'auto' }}>
            {teams.map((team) => (
              <IonItem
                key={team.id}
                button
                onClick={() => onTeamSelect(team.id, team.name)}
                detail={true}
              >
                <IonLabel>
                  <h3>{team.name}</h3>
                  {team.liga && <IonNote>{team.liga}</IonNote>}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonCardContent>
    </IonCard>
  );
};
