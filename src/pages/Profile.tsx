import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonLoading,
  IonToast,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
  IonCheckbox,
  IonAlert,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonSpinner,
} from '@ionic/react';
import { personCircleOutline, trashOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { supabase } from '../config/supabase';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, profile, updateProfile, signOut, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rememberLastSelection, setRememberLastSelection] = useState(true);
  const [lastSport, setLastSport] = useState('');
  const [lastClubName, setLastClubName] = useState('');
  const [lastTeamName, setLastTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const history = useHistory();

  useEffect(() => {
    console.log('[Profile] Auth state:', { user: !!user, authLoading, loadingProfile });
    if (user) {
      console.log('[Profile] User found, loading profile...');
      loadProfile();
    } else if (!authLoading) {
      console.log('[Profile] No user and auth finished loading');
      setLoadingProfile(false);
    }
  }, [user, authLoading]);

  const loadProfile = async () => {
    if (!user) {
      console.log('[Profile] loadProfile called but no user');
      return;
    }

    try {
      console.log('[Profile] Loading profile data from database...');
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, remember_last_selection, last_sport, last_club_id, last_team_id')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[Profile] Error loading profile:', error);
        throw error;
      }

      if (data) {
        console.log('[Profile] Profile data loaded successfully');
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setRememberLastSelection(data.remember_last_selection ?? true);

        if (data.last_sport) {
          const sportLabels: Record<string, string> = {
            unihockey: 'Unihockey',
            volleyball: 'Volleyball',
            handball: 'Handball'
          };
          setLastSport(sportLabels[data.last_sport] || data.last_sport);
        }
      } else {
        console.log('[Profile] No profile data found');
      }
    } catch (error: any) {
      console.error('[Profile] Error loading profile:', error);
      setError(error.message);
    } finally {
      console.log('[Profile] Finished loading profile');
      setLoadingProfile(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName || null,
          last_name: lastName || null,
          remember_last_selection: rememberLastSelection,
        })
        .eq('id', user!.id);

      if (error) throw error;

      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Bitte gib "DELETE" ein, um zu bestätigen.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Nicht angemeldet');
      }

      const { error } = await supabase.functions.invoke('delete-account', {
        body: { confirmation: deleteConfirmation },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      await signOut();
      history.push('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setError(error.message || 'Account konnte nicht gelöscht werden');
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
      setDeleteConfirmation('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    history.push('/login');
  };

  const handleLogin = () => {
    history.push('/login');
  };

  // Show loading spinner while checking auth state
  if (authLoading || loadingProfile) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Profil</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="profile-page">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Only show "not logged in" if definitely not authenticated
  if (!user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Profil</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="profile-page">
          <div className="login-prompt-container">
            <IonCard className="login-prompt-card">
              <IonCardContent>
                <div className="profile-icon">
                  <IonIcon icon={personCircleOutline} />
                </div>
                <h2>Nicht angemeldet</h2>
                <IonText className="prompt-text">
                  <p>
                    Melde dich an, um dein Profil zu sehen und zu bearbeiten.
                  </p>
                </IonText>
                <IonButton
                  expand="block"
                  onClick={handleLogin}
                  className="login-button"
                >
                  Jetzt anmelden
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="profile-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Personal Information Card */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Persönliche Informationen</IonCardTitle>
              <IonCardSubtitle>Aktualisiere deine persönlichen Daten</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleUpdate}>
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput type="email" value={user?.email} disabled />
                </IonItem>
                <IonText color="medium" style={{ fontSize: '0.875rem', padding: '0 16px', display: 'block', marginTop: '0.5rem' }}>
                  Die E-Mail-Adresse kann nicht geändert werden
                </IonText>

                <IonItem style={{ marginTop: '1rem' }}>
                  <IonLabel position="floating">Vorname</IonLabel>
                  <IonInput
                    type="text"
                    value={firstName}
                    onIonInput={(e) => setFirstName(e.detail.value!)}
                    placeholder="Max"
                  />
                </IonItem>

                <IonItem style={{ marginTop: '1rem' }}>
                  <IonLabel position="floating">Nachname</IonLabel>
                  <IonInput
                    type="text"
                    value={lastName}
                    onIonInput={(e) => setLastName(e.detail.value!)}
                    placeholder="Mustermann"
                  />
                </IonItem>

                <div style={{ marginTop: '1.5rem', padding: '0 16px' }}>
                  <IonText>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Studio-Einstellungen</h3>
                  </IonText>
                  <IonItem lines="none" style={{ '--padding-start': '0px' }}>
                    <IonCheckbox
                      checked={rememberLastSelection}
                      onIonChange={(e) => setRememberLastSelection(e.detail.checked)}
                      slot="start"
                    />
                    <IonLabel style={{ marginLeft: '0.5rem' }}>Letzte Auswahl merken</IonLabel>
                  </IonItem>
                  <IonText color="medium" style={{ fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
                    Wenn aktiviert, wird deine letzte Club- und Teamauswahl im Studio gespeichert.
                  </IonText>

                  {rememberLastSelection && lastSport && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'var(--ion-color-light)',
                      borderRadius: '8px'
                    }}>
                      <IonText>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                          Gespeicherte Auswahl:
                        </p>
                        <p style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--ion-color-medium)' }}>Sportart: </span>
                          <span style={{ fontWeight: 500 }}>{lastSport}</span>
                        </p>
                        {lastClubName && (
                          <p style={{ fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--ion-color-medium)' }}>Club: </span>
                            <span style={{ fontWeight: 500 }}>{lastClubName}</span>
                          </p>
                        )}
                        {lastTeamName && (
                          <p style={{ fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--ion-color-medium)' }}>Team: </span>
                            <span style={{ fontWeight: 500 }}>{lastTeamName}</span>
                          </p>
                        )}
                      </IonText>
                    </div>
                  )}
                </div>

                <IonButton expand="block" type="submit" className="ion-margin-top" disabled={loading}>
                  Profil speichern
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Sign Out Button */}
          <IonButton
            expand="block"
            color="medium"
            className="ion-margin-top"
            onClick={handleSignOut}
          >
            Abmelden
          </IonButton>

          {/* Delete Account Card */}
          <IonCard style={{ marginTop: '2rem', borderColor: 'var(--ion-color-danger)' }}>
            <IonCardHeader>
              <IonCardTitle style={{ color: 'var(--ion-color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IonIcon icon={trashOutline} />
                Gefahrenzone
              </IonCardTitle>
              <IonCardSubtitle>Unwiderrufliche Aktionen</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{
                background: 'rgba(var(--ion-color-danger-rgb), 0.1)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <IonText>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ion-color-danger)' }}>
                    Profil löschen
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ion-color-medium)', marginBottom: '1rem' }}>
                    Das Löschen deines Profils ist dauerhaft und kann nicht rückgängig gemacht werden.
                    Alle deine Daten, Templates und Abonnements gehen unwiderruflich verloren.
                  </p>
                </IonText>
                <IonButton
                  color="danger"
                  size="small"
                  onClick={() => setShowDeleteAlert(true)}
                >
                  <IonIcon icon={trashOutline} slot="start" />
                  Profil löschen
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => {
            setShowDeleteAlert(false);
            setDeleteConfirmation('');
          }}
          header="Bist du absolut sicher?"
          message="Diese Aktion kann nicht rückgängig gemacht werden. Dein Account und alle zugehörigen Daten werden dauerhaft gelöscht. Bitte gib 'DELETE' ein, um zu bestätigen:"
          inputs={[
            {
              name: 'confirmation',
              type: 'text',
              placeholder: 'DELETE',
              value: deleteConfirmation,
              handler: (input) => {
                setDeleteConfirmation(input.value);
              }
            }
          ]}
          buttons={[
            {
              text: 'Abbrechen',
              role: 'cancel',
              handler: () => {
                setDeleteConfirmation('');
              }
            },
            {
              text: 'Account endgültig löschen',
              role: 'destructive',
              handler: () => {
                handleDeleteAccount();
              }
            }
          ]}
        />

        <IonLoading isOpen={loading} message="Bitte warten..." />
        <IonToast
          isOpen={!!error}
          message={error}
          duration={3000}
          onDidDismiss={() => setError('')}
          color="danger"
        />
        <IonToast
          isOpen={success}
          message="Profil erfolgreich aktualisiert!"
          duration={2000}
          onDidDismiss={() => setSuccess(false)}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
