import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import {
  createOutline,
  layersOutline,
  personOutline,
  logInOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Kanva</IonTitle>
          <IonButtons slot="end">
            {user ? (
              <IonButton onClick={() => history.push('/profile')}>
                <IonAvatar className="header-avatar">
                  <img
                    src={profile?.avatar_url || 'https://ionicframework.com/docs/img/demos/avatar.svg'}
                    alt="Profile"
                  />
                </IonAvatar>
              </IonButton>
            ) : (
              <IonButton onClick={() => history.push('/login')}>
                <IonIcon icon={logInOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="home-header">
          <img src="/assets/logo_wide.png" alt="Kanva Logo" className="home-logo" />
          <h1>Create Beautiful Designs</h1>
          <p>Design graphics, social media posts, and more with our easy-to-use studio</p>
        </div>

        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard button onClick={() => history.push('/studio')}>
                <IonCardHeader>
                  <div className="card-icon-container">
                    <IonIcon icon={createOutline} className="card-icon" />
                  </div>
                  <IonCardTitle>Create Design</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Start from scratch and create your own custom design with our powerful
                  studio tools.
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6">
              <IonCard button onClick={() => history.push('/templates')}>
                <IonCardHeader>
                  <div className="card-icon-container">
                    <IonIcon icon={layersOutline} className="card-icon" />
                  </div>
                  <IonCardTitle>Browse Templates</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Choose from our collection of professionally designed templates to get
                  started quickly.
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {!user && (
            <IonRow>
              <IonCol size="12">
                <IonCard className="auth-card">
                  <IonCardHeader>
                    <div className="card-icon-container">
                      <IonIcon icon={personOutline} className="card-icon" />
                    </div>
                    <IonCardTitle>Get Started</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>Sign in or create an account to save your designs and access them from anywhere.</p>
                    <div className="auth-buttons">
                      <IonButton expand="block" onClick={() => history.push('/login')}>
                        Sign In
                      </IonButton>
                      <IonButton expand="block" fill="outline" onClick={() => history.push('/register')}>
                        Create Account
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
