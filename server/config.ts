// Configuration file to ensure environment variables are properly loaded
export const config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_PATH: process.env.DATABASE_PATH || './data/app.db',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
};

// Log config on startup (hide sensitive data)
console.log('Config loaded:');
console.log('- PORT:', config.PORT);
console.log('- NODE_ENV:', config.NODE_ENV);
console.log('- JWT_SECRET set:', !!config.JWT_SECRET);
console.log('- GROQ_API_KEY:', config.GROQ_API_KEY ? `${config.GROQ_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('Raw env:', {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  GROQ_API_KEY: process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 10)}...` : 'NOT SET'
});
