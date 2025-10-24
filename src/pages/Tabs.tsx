import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { createOutline, personOutline } from 'ionicons/icons';
import Studio from './Studio';
import Profile from './Profile';

const Tabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/studio">
          <Studio />
        </Route>
        <Route exact path="/tabs/profile">
          <Profile />
        </Route>
        <Route exact path="/tabs">
          <Redirect to="/tabs/studio" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom" className="kanva-tab-bar">
        <IonTabButton tab="studio" href="/tabs/studio">
          <IonIcon icon={createOutline} />
          <IonLabel>Studio</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/tabs/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
