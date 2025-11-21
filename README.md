# Devlabs Frontend

Devlabs Frontend is a comprehensive web application for managing academic projects, courses, and student evaluations. It provides an intuitive interface for administrators, faculty, and students to collaborate on project-based learning effectively.

## ✨ Features

### 🎓 Academic Management

- **Course Management:** Create, organize, and manage courses with detailed information
- **Semester Organization:** Structure courses within academic semesters
- **Student & Faculty Management:** Assign users to courses and manage permissions
- **Batch Assignment:** Group students into batches for better organization

### 📋 Project & Team Management

- **Project Creation & Tracking:** Comprehensive project lifecycle management
- **Team Formation:** Organize students into teams for collaborative projects
- **Project Status Tracking:** Monitor projects through various stages (Proposed, Ongoing, Completed, Rejected)
- **File Upload & Management:** Handle project deliverables and documentation

### 📊 Evaluation & Assessment

- **Course Evaluations:** Detailed evaluation forms with customizable criteria
- **Individual Scoring:** Peer and instructor evaluations with scoring rubrics
- **Review System:** Multi-stage review process for project assessments
- **Performance Analytics:** Real-time insights into student and course performance

### 📈 Analytics & Reporting

- **Performance Dashboards:** Visual analytics for students and instructors
- **Progress Tracking:** Monitor completion rates and performance trends
- **Data Export:** Export performance data for external analysis
- **Interactive Charts:** Comprehensive charts and visualizations using Recharts

### 🔐 Authentication & Authorization

- **Role-Based Access:** Different interfaces for students, faculty, and administrators
- **Secure Authentication:** NextAuth integration for secure user management
- **Permission Management:** Granular control over user capabilities

### 🎨 User Experience

- **Responsive Design:** Works seamlessly on desktop and mobile devices
- **Dark/Light Mode:** Theme switching for better user experience
- **Drag & Drop:** Intuitive interactions for kanban boards and file uploads
- **Real-time Updates:** Live data synchronization using React Query

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React 19](https://reactjs.org/)
- **Component Library:** [shadcn/ui](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [React Query (TanStack Query)](https://tanstack.com/query/latest) + [Jotai](https://jotai.org/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Package Manager:** [pnpm](https://pnpm.io/)

## 🚀 Getting Started

Follow these steps to run the project locally for development and testing purposes.

### Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** (recommended) or npm/yarn

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/TharunCodes07/devlabs-frontend.git
    cd devlabs-frontend
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    # or
    npm install
    ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and configure your environment variables:

    ```env
    NEXTAUTH_SECRET=your-secret-key
    NEXTAUTH_URL=http://localhost:3000
    # Add other required environment variables
    ```

4. **Run the development server:**

    ```bash
    pnpm dev
    # or
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint for code quality checks

### Tailwind CSS

Styling is handled through Tailwind CSS with custom configurations for the design system.

## 🌟 Key Features Breakdown

### Course Management

- Create and manage academic courses
- Assign instructors and students
- Organize courses within semesters
- Track course-specific performance metrics

### Project Lifecycle

- Project proposal and approval workflow
- Team assignment and collaboration tools
- File upload and version management
- Multi-stage review and evaluation process

### Evaluation System

- Customizable evaluation criteria
- Peer and instructor assessments
- Real-time scoring and feedback
- Comprehensive rubric management

### Analytics Dashboard

- Performance tracking across courses and projects
- Visual representations of progress and achievements
- Export capabilities for detailed reporting
- Trend analysis and insights

## 🤝 Contributing

We welcome contributions! Whether it's fixing a bug, improving documentation, or suggesting new features, your input is appreciated.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Use TypeScript for type safety
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

Built with ❤️ by the Devlabs team.
