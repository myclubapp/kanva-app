export type Language = 'de' | 'en';

export const translations = {
  de: {
    // Navigation
    nav: {
      studio: 'Studio',
      templates: 'Vorlagen',
      logos: 'Logos',
      profile: 'Profil',
    },

    // Pricing/Subscription Tiers
    pricing: {
      free: {
        name: 'Free',
        emoji: '🟢',
        teams: '1 Team',
        templates: 'Standard-Vorlagen (mit KANVA-Branding)',
        games: '1 Spiel',
        features: [
          'Standard-Vorlagen',
          'Kein eigenes Branding',
          'Teamwechsel nur alle 7 Tage',
        ],
      },
      amateur: {
        name: 'Amateur',
        emoji: '🟡',
        price: '6.90',
        period: '/Monat',
        teams: 'bis 3 Teams',
        templates: 'bis 2 eigene Vorlagen',
        games: '2 Spiele (via API)',
        features: [
          'Alle Free-Features',
          'Eigene Vorlagen mit dem Designer von KANVA erstellen und verwalten',
        ],
      },
      pro: {
        name: 'Pro',
        emoji: '🟠',
        price: '15.00',
        period: '/Monat',
        teams: 'bis 6 Teams',
        templates: 'bis 5 eigene Vorlagen',
        games: 'bis zu 3 Spiele (via API)',
        features: [
          'Alle Amateur-Features',
          'Eigene Logoverwaltung für Sponsoren, Teams und Vereine',
        ],
      },
      premium: {
        name: 'Premium',
        emoji: '🔵',
        price: '30.00',
        period: '/Monat',
        teams: 'Unbegrenzt Teams',
        templates: 'Unbegrenzt eigene Vorlagen',
        games: 'Unbegrenzt Spiele (via API)',
        features: [
          'Alle Pro-Features',
          'Priority Support',
        ],
      },
    },

    // Studio Page
    studio: {
      title: 'KANVA - Studio',
      subtitle: 'Wo Emotionen zu Stories werden. Teile, was deinen Verein einzigartig macht – auf und neben dem Spielfeld.',
      selectSport: 'Sportart auswählen',
      selectSportDescription: 'Wähle die Sportart, für die du Designs erstellen möchtest',
      selectSportPlaceholder: 'Sportart wählen...',
      selectClub: 'Verein auswählen',
      selectClubDescription: 'Suche und wähle deinen Verein',
      selectTeam: 'Team auswählen',
      selectTeamDescription: 'Wähle das Team für das du Designs erstellen möchtest',
      selectGame: 'Spiel auswählen',
      selectGameDescription: 'Wähle das Spiel, das du teilen möchtest',
      back: 'Zurück',
      backToGameSelection: 'Zurück zur Spielauswahl',
      exportAsImage: 'Als Bild exportieren',
    },

    // Templates Page
    templates: {
      title: 'Vorlagen',
      subtitle: 'Verwalte deine eigenen Vorlagen',
      premiumTitle: 'Premium-Feature',
      premiumDescription: 'Zugriff auf professionelle Vorlagen und die Möglichkeit, eigene Vorlagen zu erstellen, ist nur mit einem Premium-Abo verfügbar.',
      loginRequired: 'Bitte melde dich an, um ein Abo abzuschließen.',
      loginButton: 'Jetzt anmelden',
      upgradeButton: 'Jetzt upgraden',
      uploadButton: 'Vorlage hochladen',
      createButton: 'Neue Vorlage erstellen',
      noTemplates: 'Noch keine Vorlagen vorhanden',
      createFirst: 'Erstelle deine erste eigene Vorlage',
    },

    // Logos Page
    logos: {
      title: 'Logos',
      subtitle: 'Verwalte deine Logos für Sponsoren, Teams und Vereine',
      premiumTitle: 'Premium-Feature',
      premiumDescription: 'Logo-Verwaltung ist ab dem Pro-Abo verfügbar.',
      loginRequired: 'Bitte melde dich an, um ein Abo abzuschließen.',
      loginButton: 'Jetzt anmelden',
      upgradeButton: 'Jetzt upgraden',
      uploadButton: 'Logo hochladen',
      noLogos: 'Noch keine Logos vorhanden',
      uploadFirst: 'Lade dein erstes Logo hoch',
      sponsor: 'Sponsor',
      team: 'Team',
      club: 'Verein',
    },

    // Profile Page
    profile: {
      title: 'Profil',
      notLoggedIn: 'Nicht angemeldet',
      loginPrompt: 'Melde dich an, um dein Profil zu sehen und zu bearbeiten.',
      loginButton: 'Jetzt anmelden',
      personalInfo: 'Persönliche Informationen',
      email: 'Email',
      name: 'Name',
      updateButton: 'Profil aktualisieren',
      logoutButton: 'Abmelden',
      subscription: 'Abonnement',
      currentPlan: 'Aktueller Plan',
      upgradePlan: 'Plan upgraden',
      manageSub: 'Abo verwalten',
    },

    // Common
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolgreich',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      upload: 'Hochladen',
      close: 'Schließen',
    },
  },

  en: {
    // Navigation
    nav: {
      studio: 'Studio',
      templates: 'Templates',
      logos: 'Logos',
      profile: 'Profile',
    },

    // Pricing/Subscription Tiers
    pricing: {
      free: {
        name: 'Free',
        emoji: '🟢',
        teams: '1 Team',
        templates: 'Standard Templates (with KANVA branding)',
        games: '1 Game',
        features: [
          'Standard templates',
          'No custom branding',
          'Team change only every 7 days',
        ],
      },
      amateur: {
        name: 'Amateur',
        emoji: '🟡',
        price: '6.90',
        period: '/month',
        teams: 'up to 3 Teams',
        templates: 'up to 2 custom templates',
        games: '2 Games (via API)',
        features: [
          'All Free features',
          'Create and manage your own templates with the KANVA designer',
        ],
      },
      pro: {
        name: 'Pro',
        emoji: '🟠',
        price: '15.00',
        period: '/month',
        teams: 'up to 6 Teams',
        templates: 'up to 5 custom templates',
        games: 'up to 3 Games (via API)',
        features: [
          'All Amateur features',
          'Custom logo management for sponsors, teams and clubs',
        ],
      },
      premium: {
        name: 'Premium',
        emoji: '🔵',
        price: '30.00',
        period: '/month',
        teams: 'Unlimited Teams',
        templates: 'Unlimited custom templates',
        games: 'Unlimited Games (via API)',
        features: [
          'All Pro features',
          'Priority support',
        ],
      },
    },

    // Studio Page
    studio: {
      title: 'Create your first design',
      subtitle: 'Choose a sport first',
      selectSport: 'Select sport',
      selectSportDescription: 'Choose the sport you want to create designs for',
      selectSportPlaceholder: 'Select sport...',
      selectClub: 'Select club',
      selectClubDescription: 'Search and select your club',
      selectTeam: 'Select team',
      selectTeamDescription: 'Choose the team you want to create designs for',
      selectGame: 'Select game',
      selectGameDescription: 'Choose the game you want to share',
      back: 'Back',
      backToGameSelection: 'Back to game selection',
      exportAsImage: 'Export as image',
    },

    // Templates Page
    templates: {
      title: 'Templates',
      subtitle: 'Manage your custom templates',
      premiumTitle: 'Premium Feature',
      premiumDescription: 'Access to professional templates and the ability to create your own is only available with a premium subscription.',
      loginRequired: 'Please sign in to subscribe.',
      loginButton: 'Sign in now',
      upgradeButton: 'Upgrade now',
      uploadButton: 'Upload template',
      createButton: 'Create new template',
      noTemplates: 'No templates yet',
      createFirst: 'Create your first custom template',
    },

    // Logos Page
    logos: {
      title: 'Logos',
      subtitle: 'Manage your logos for sponsors, teams and clubs',
      premiumTitle: 'Premium Feature',
      premiumDescription: 'Logo management is available starting with the Pro subscription.',
      loginRequired: 'Please sign in to subscribe.',
      loginButton: 'Sign in now',
      upgradeButton: 'Upgrade now',
      uploadButton: 'Upload logo',
      noLogos: 'No logos yet',
      uploadFirst: 'Upload your first logo',
      sponsor: 'Sponsor',
      team: 'Team',
      club: 'Club',
    },

    // Profile Page
    profile: {
      title: 'Profile',
      notLoggedIn: 'Not logged in',
      loginPrompt: 'Sign in to view and edit your profile.',
      loginButton: 'Sign in now',
      personalInfo: 'Personal Information',
      email: 'Email',
      name: 'Name',
      updateButton: 'Update profile',
      logoutButton: 'Sign out',
      subscription: 'Subscription',
      currentPlan: 'Current Plan',
      upgradePlan: 'Upgrade plan',
      manageSub: 'Manage subscription',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      upload: 'Upload',
      close: 'Close',
    },
  },
};

// Helper function to get translation
export function getTranslation(lang: Language = 'de') {
  return translations[lang];
}
