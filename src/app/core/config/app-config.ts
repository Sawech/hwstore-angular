export const AppConfig = {
  apiUrl: 'http://localhost:3000/api',
  // apiUrl: 'https://semiplastic-strident-joi.ngrok-free.dev/api',

  /** App metadata */
  appName: 'HWstore',
  appTagline: 'Excellence en Solutions Informatiques',

  /** Pagination defaults */
  defaultPageSize: 12,

  /** Store contact info */
  contact: {
    address: '39 avenue ziar abdelader-Bologhine, Alger, Algérie, 16100',
    phone: '+213 553 11 56 92',
    email: 'hwstoredz@hotmail.com',
  },
} as const;
