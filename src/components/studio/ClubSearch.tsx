import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonText,
  IonNote,
} from '@ionic/react';
import { checkmarkCircle, business, informationCircle } from 'ionicons/icons';

type SportType = 'unihockey' | 'volleyball' | 'handball';

interface Club {
  id: string;
  name: string;
}

interface ClubSearchProps {
  sportType: SportType;
  onClubSelect: (clubId: string, clubName: string) => void;
}

const SPORT_API_URLS: Record<SportType, string> = {
  unihockey: 'https://europe-west6-myclubmanagement.cloudfunctions.net/api/swissunihockey?query=%7B%0A%20%20clubs%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%7D%20%0A%7D',
  volleyball: 'https://europe-west6-myclubmanagement.cloudfunctions.net/api/swissvolley?query=%7B%0A%20%20clubs%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%7D%0A%7D%0A',
  handball: 'https://europe-west6-myclubmanagement.cloudfunctions.net/api/swisshandball?query=%7B%0A%20%20clubs%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%7D%0A%7D%0A'
};

const SPORT_LABELS: Record<SportType, string> = {
  unihockey: 'Unihockey',
  volleyball: 'Volleyball',
  handball: 'Handball'
};

export const ClubSearch: React.FC<ClubSearchProps> = ({ sportType, onClubSelect }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const apiUrl = SPORT_API_URLS[sportType];
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error('Fehler beim Laden der Clubs');

        const result = await response.json();
        const data: Club[] = result.data?.clubs || [];

        const sortedClubs = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setClubs(sortedClubs);
        setFilteredClubs(sortedClubs);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [sportType]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredClubs(clubs);
    } else {
      const filtered = clubs.filter(club =>
        club.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredClubs(filtered);
    }
  }, [searchText, clubs]);

  const handleClubSelect = (clubId: string, clubName: string) => {
    setSelectedClubId(clubId);
    onClubSelect(clubId, clubName);
  };

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
        <IonCardTitle>{SPORT_LABELS[sportType]} Club auswählen</IonCardTitle>
        <IonCardSubtitle>
          {clubs.length} Clubs verfügbar
        </IonCardSubtitle>
        {sportType === 'handball' && (
          <IonNote color="primary" style={{ marginTop: '1rem', display: 'block' }}>
            <IonIcon icon={informationCircle} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Damit du KANVA für deinen Handball Verein nutzen kannst, musst du zuerst deinen API Key hochladen.{' '}
            <a
              href="https://www.handball.ch/de/news/2023/api-schnittstellen-wechsel-fuer-vereine-erforderlich/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              Hier bekommst du einen API-Key
            </a>
          </IonNote>
        )}
      </IonCardHeader>
      <IonCardContent>
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Club suchen..."
          debounce={300}
        />

        {filteredClubs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--ion-color-medium)' }}>
            <IonIcon icon={business} style={{ fontSize: '3rem', opacity: 0.5 }} />
            <p>Keine Clubs gefunden</p>
          </div>
        ) : (
          <IonList style={{ maxHeight: '400px', overflow: 'auto' }}>
            {filteredClubs.map((club) => (
              <IonItem
                key={club.id}
                button
                onClick={() => handleClubSelect(club.id, club.name)}
                detail={false}
              >
                <IonIcon
                  icon={checkmarkCircle}
                  slot="start"
                  color="success"
                  style={{ opacity: selectedClubId === club.id ? 1 : 0 }}
                />
                <IonLabel>{club.name}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonCardContent>
    </IonCard>
  );
};
