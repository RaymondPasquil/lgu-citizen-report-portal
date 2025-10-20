# 🏛️ LGU Citizen Report Portal

A comprehensive citizen engagement platform for Local Government Units (LGUs) to receive, manage, and respond to citizen reports and concerns.

## 🌟 Features

### 📱 Citizen Features
- **Report Submission**: Easy-to-use form for submitting various types of reports
- **Image Upload**: Attach photos to reports for better documentation
- **Report Tracking**: Monitor the status of submitted reports
- **Anonymous Reporting**: Option to submit reports anonymously
- **Mobile Responsive**: Works seamlessly on all devices

### 🛠️ Admin Features
- **Dashboard**: Comprehensive overview of all reports and statistics
- **Report Management**: View, update, and manage all citizen reports
- **Category Management**: Organize reports by categories
- **User Management**: Manage citizen accounts and permissions
- **Analytics**: Detailed insights and reporting
- **Notifications**: Real-time alerts for new reports

### 🔧 Technical Features
- **Real-time Updates**: Live status updates using WebSocket
- **AI Integration**: Automated report categorization and analysis
- **Secure Authentication**: NextAuth.js for secure user management
- **Database**: PostgreSQL with Prisma ORM
- **Modern UI**: Built with Next.js 15, TypeScript, and Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Render account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lgu-citizen-report-portal.git
   cd lgu-citizen-report-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="[YOUR-SECRET-KEY]"
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- [📋 Installation Guide](./INSTALLATION.md) - Detailed setup instructions
- [🚀 Deployment Checklist](./DEPLOYMENT-CHECKLIST.md) - Production deployment guide
- [🔧 Configuration](./docs/CONFIGURATION.md) - Advanced configuration options
- [📚 API Documentation](./docs/API.md) - REST API reference

## 🏗️ Architecture

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database toolkit
- **NextAuth.js** - Authentication library
- **Socket.io** - Real-time communication
- **ZAI SDK** - AI integration

### Database
- **PostgreSQL** - Primary database
- **Supabase** - Database hosting and management

### Deployment
- **Render.com** - Application hosting
- **GitHub** - Version control and CI/CD
- **Vercel** - Alternative hosting option

## 📊 Database Schema

The application uses the following main tables:

- **users** - User accounts and profiles
- **reports** - Citizen reports and concerns
- **categories** - Report categories
- **comments** - Report discussions
- **notifications** - User notifications

```sql
-- Example: Reports table structure
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  location VARCHAR(255),
  images TEXT[],
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Security

- **Authentication**: NextAuth.js with multiple providers
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **HTTPS**: SSL/TLS encryption in production
- **Environment Variables**: Secure configuration management

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Check code quality
npm run lint
npm run type-check
```

## 📱 Mobile App

The portal is fully responsive and works on all mobile devices. For a native mobile experience, consider using:

- **React Native** - For iOS and Android apps
- **PWA** - Progressive Web App capabilities
- **Capacitor** - Web-to-native app conversion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation
- Use TypeScript strictly
- Follow accessibility best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Supabase** - For the excellent database service
- **Render** - For the generous hosting platform
- **shadcn/ui** - For the beautiful UI components
- **Open Source Community** - For the invaluable tools and libraries

## 📞 Support

If you need help or have questions:

- 📧 Email: support@lgu-portal.gov
- 💬 Discord: [Join our community](https://discord.gg/lgu-portal)
- 🐛 Issues: [Report bugs on GitHub](https://github.com/your-username/lgu-citizen-report-portal/issues)
- 📖 Documentation: [View full docs](https://lgu-portal-docs.vercel.app)

## 🗺️ Roadmap

### Version 2.0 (Upcoming)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Video report submissions
- [ ] AI-powered report analysis

### Version 1.5 (In Progress)
- [ ] SMS notifications
- [ ] Offline mode support
- [ ] Advanced filtering
- [ ] Bulk operations
- [ ] API rate limiting

### Version 1.0 (Current)
- [x] Basic report submission
- [x] Admin dashboard
- [x] User authentication
- [x] Image uploads
- [x] Real-time updates

---

## 🌟 Made with ❤️ for Citizens and Government

This project aims to bridge the gap between citizens and local government, making it easier for communities to report issues and for governments to respond effectively.

**Together, we can build better communities!** 🏛️