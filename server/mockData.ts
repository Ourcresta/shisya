import type { Course, Module, Lesson, AINotes, Project, TestWithQuestions } from "@shared/schema";

// Mock courses data for development (until admin backend is deployed)
export const mockCourses: Course[] = [
  {
    id: 1,
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript. Build your first responsive website from scratch.",
    level: "beginner",
    duration: "8 hours",
    skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Git Basics"],
    status: "published",
    testRequired: true,
    projectRequired: true,
    creditCost: 0,
    isFree: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: 2,
    title: "React Fundamentals",
    description: "Master React.js from the ground up. Learn components, state management, hooks, and build modern user interfaces.",
    level: "intermediate",
    duration: "12 hours",
    skills: ["React", "JSX", "Hooks", "State Management", "Component Design"],
    status: "published",
    testRequired: true,
    projectRequired: true,
    creditCost: 120,
    isFree: false,
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-10T11:00:00Z",
  },
  {
    id: 3,
    title: "Advanced TypeScript Patterns",
    description: "Deep dive into TypeScript's advanced features. Learn generics, utility types, decorators, and design patterns for large-scale applications.",
    level: "advanced",
    duration: "10 hours",
    skills: ["TypeScript", "Generics", "Design Patterns", "Type Safety", "Advanced Types"],
    status: "published",
    testRequired: true,
    projectRequired: false,
    creditCost: 200,
    isFree: false,
    createdAt: "2024-02-15T08:00:00Z",
    updatedAt: "2024-02-20T16:00:00Z",
  },
  {
    id: 4,
    title: "Python for Data Science",
    description: "Learn Python programming with a focus on data science. Cover NumPy, Pandas, and data visualization techniques.",
    level: "beginner",
    duration: "15 hours",
    skills: ["Python", "NumPy", "Pandas", "Data Visualization", "Statistics"],
    status: "published",
    testRequired: true,
    projectRequired: true,
    creditCost: 0,
    isFree: true,
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-05T12:00:00Z",
  },
  {
    id: 5,
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js and Express. Learn REST APIs, database integration, and authentication.",
    level: "intermediate",
    duration: "14 hours",
    skills: ["Node.js", "Express", "REST APIs", "MongoDB", "Authentication"],
    status: "published",
    testRequired: true,
    projectRequired: true,
    creditCost: 150,
    isFree: false,
    createdAt: "2024-03-10T09:00:00Z",
    updatedAt: "2024-03-15T14:00:00Z",
  },
  {
    id: 6,
    title: "Cloud Architecture with AWS",
    description: "Master AWS cloud services and architecture patterns. Deploy, scale, and manage applications in the cloud.",
    level: "advanced",
    duration: "20 hours",
    skills: ["AWS", "EC2", "S3", "Lambda", "CloudFormation", "DevOps"],
    status: "published",
    testRequired: true,
    projectRequired: true,
    creditCost: 300,
    isFree: false,
    createdAt: "2024-03-20T08:00:00Z",
    updatedAt: "2024-03-25T10:00:00Z",
  },
];

// Mock modules data
export const mockModules: Record<number, Module[]> = {
  1: [
    { id: 1, courseId: 1, title: "Getting Started with HTML", description: "Learn HTML basics", orderIndex: 1, estimatedTime: "2 hours", createdAt: null, updatedAt: null },
    { id: 2, courseId: 1, title: "Styling with CSS", description: "CSS fundamentals", orderIndex: 2, estimatedTime: "2 hours", createdAt: null, updatedAt: null },
    { id: 3, courseId: 1, title: "JavaScript Essentials", description: "JavaScript basics", orderIndex: 3, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
    { id: 4, courseId: 1, title: "Building Your First Website", description: "Putting it all together", orderIndex: 4, estimatedTime: "1 hour", createdAt: null, updatedAt: null },
  ],
  2: [
    { id: 5, courseId: 2, title: "React Basics", description: "Introduction to React", orderIndex: 1, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
    { id: 6, courseId: 2, title: "Components & Props", description: "Building with components", orderIndex: 2, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
    { id: 7, courseId: 2, title: "State & Lifecycle", description: "Managing state", orderIndex: 3, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
    { id: 8, courseId: 2, title: "Hooks Deep Dive", description: "Modern React hooks", orderIndex: 4, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
  ],
  3: [
    { id: 9, courseId: 3, title: "Generics Mastery", description: "Advanced generics", orderIndex: 1, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
    { id: 10, courseId: 3, title: "Utility Types", description: "Built-in utility types", orderIndex: 2, estimatedTime: "2 hours", createdAt: null, updatedAt: null },
    { id: 11, courseId: 3, title: "Design Patterns in TS", description: "Common patterns", orderIndex: 3, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
    { id: 12, courseId: 3, title: "Type-Safe Architecture", description: "Building type-safe apps", orderIndex: 4, estimatedTime: "2 hours", createdAt: null, updatedAt: null },
  ],
  4: [
    { id: 13, courseId: 4, title: "Python Fundamentals", description: "Python basics", orderIndex: 1, estimatedTime: "4 hours", createdAt: null, updatedAt: null },
    { id: 14, courseId: 4, title: "NumPy for Numerical Computing", description: "Working with arrays", orderIndex: 2, estimatedTime: "4 hours", createdAt: null, updatedAt: null },
    { id: 15, courseId: 4, title: "Pandas for Data Analysis", description: "DataFrames and analysis", orderIndex: 3, estimatedTime: "4 hours", createdAt: null, updatedAt: null },
    { id: 16, courseId: 4, title: "Data Visualization", description: "Charts and plots", orderIndex: 4, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
  ],
  5: [
    { id: 17, courseId: 5, title: "Node.js Fundamentals", description: "Node.js basics", orderIndex: 1, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
    { id: 18, courseId: 5, title: "Express.js Framework", description: "Building with Express", orderIndex: 2, estimatedTime: "4 hours", createdAt: null, updatedAt: null },
    { id: 19, courseId: 5, title: "Database Integration", description: "MongoDB and SQL", orderIndex: 3, estimatedTime: "4 hours", createdAt: null, updatedAt: null },
    { id: 20, courseId: 5, title: "Authentication & Security", description: "Securing your API", orderIndex: 4, estimatedTime: "3 hours", createdAt: null, updatedAt: null },
  ],
  6: [
    { id: 21, courseId: 6, title: "AWS Fundamentals", description: "Cloud basics", orderIndex: 1, estimatedTime: "4 hours", createdAt: null, updatedAt: null },
    { id: 22, courseId: 6, title: "Compute Services", description: "EC2 and Lambda", orderIndex: 2, estimatedTime: "5 hours", createdAt: null, updatedAt: null },
    { id: 23, courseId: 6, title: "Storage & Databases", description: "S3 and RDS", orderIndex: 3, estimatedTime: "5 hours", createdAt: null, updatedAt: null },
    { id: 24, courseId: 6, title: "Infrastructure as Code", description: "CloudFormation", orderIndex: 4, estimatedTime: "6 hours", createdAt: null, updatedAt: null },
  ],
};

// Mock lessons data
export const mockLessons: Record<number, Lesson[]> = {
  // Module 1: Getting Started with HTML
  1: [
    { id: 1, moduleId: 1, title: "What is HTML?", objectives: ["Understand what HTML is", "Learn about web browsers", "Set up your development environment"], keyConcepts: ["Markup language", "Tags and elements", "Document structure"], orderIndex: 1, estimatedTime: "20 min", videoUrl: "https://example.com/video1", externalResources: [{ title: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" }], createdAt: null, updatedAt: null },
    { id: 2, moduleId: 1, title: "HTML Document Structure", objectives: ["Create your first HTML file", "Understand the DOCTYPE", "Learn about head and body sections"], keyConcepts: ["DOCTYPE declaration", "html, head, body tags", "Meta tags"], orderIndex: 2, estimatedTime: "25 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 3, moduleId: 1, title: "Common HTML Elements", objectives: ["Use headings and paragraphs", "Add links and images", "Create lists"], keyConcepts: ["Semantic elements", "Attributes", "Nesting elements"], orderIndex: 3, estimatedTime: "30 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 4, moduleId: 1, title: "Forms and Input Elements", objectives: ["Create HTML forms", "Use different input types", "Understand form submission"], keyConcepts: ["Form elements", "Input validation", "Form actions"], orderIndex: 4, estimatedTime: "35 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
  // Module 2: Styling with CSS
  2: [
    { id: 5, moduleId: 2, title: "Introduction to CSS", objectives: ["Understand CSS purpose", "Learn CSS syntax", "Apply styles to HTML"], keyConcepts: ["Selectors", "Properties", "Values"], orderIndex: 1, estimatedTime: "25 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 6, moduleId: 2, title: "CSS Box Model", objectives: ["Understand the box model", "Use padding and margin", "Control element sizing"], keyConcepts: ["Content", "Padding", "Border", "Margin"], orderIndex: 2, estimatedTime: "30 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 7, moduleId: 2, title: "Flexbox Layout", objectives: ["Create flexible layouts", "Align items", "Distribute space"], keyConcepts: ["Flex container", "Flex items", "Alignment"], orderIndex: 3, estimatedTime: "35 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 8, moduleId: 2, title: "Responsive Design", objectives: ["Use media queries", "Create mobile-first designs", "Test responsiveness"], keyConcepts: ["Breakpoints", "Mobile-first", "Viewport"], orderIndex: 4, estimatedTime: "30 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
  // Module 3: JavaScript Essentials
  3: [
    { id: 9, moduleId: 3, title: "JavaScript Basics", objectives: ["Understand JavaScript fundamentals", "Write your first script", "Use the console"], keyConcepts: ["Variables", "Data types", "Operators"], orderIndex: 1, estimatedTime: "30 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 10, moduleId: 3, title: "Functions and Scope", objectives: ["Create functions", "Understand scope", "Use arrow functions"], keyConcepts: ["Function declaration", "Parameters", "Return values"], orderIndex: 2, estimatedTime: "35 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 11, moduleId: 3, title: "DOM Manipulation", objectives: ["Select DOM elements", "Modify content", "Handle events"], keyConcepts: ["querySelector", "Event listeners", "DOM methods"], orderIndex: 3, estimatedTime: "40 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 12, moduleId: 3, title: "Working with Arrays", objectives: ["Create and modify arrays", "Use array methods", "Iterate over data"], keyConcepts: ["Array methods", "map, filter, reduce", "Iteration"], orderIndex: 4, estimatedTime: "35 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
  // Module 4: Building Your First Website
  4: [
    { id: 13, moduleId: 4, title: "Project Setup", objectives: ["Plan your website", "Set up project structure", "Create initial files"], keyConcepts: ["Project planning", "File organization", "Best practices"], orderIndex: 1, estimatedTime: "15 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 14, moduleId: 4, title: "Building the Homepage", objectives: ["Create the homepage layout", "Add navigation", "Style the hero section"], keyConcepts: ["Layout techniques", "Navigation patterns", "Hero design"], orderIndex: 2, estimatedTime: "25 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 15, moduleId: 4, title: "Adding Interactivity", objectives: ["Add JavaScript functionality", "Create dynamic content", "Handle user input"], keyConcepts: ["Event handling", "Dynamic updates", "User feedback"], orderIndex: 3, estimatedTime: "20 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
  // Module 5: React Basics
  5: [
    { id: 16, moduleId: 5, title: "What is React?", objectives: ["Understand React philosophy", "Learn about virtual DOM", "Set up React environment"], keyConcepts: ["Component-based architecture", "Virtual DOM", "JSX"], orderIndex: 1, estimatedTime: "30 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 17, moduleId: 5, title: "Your First Component", objectives: ["Create a React component", "Understand JSX syntax", "Render components"], keyConcepts: ["Functional components", "JSX expressions", "Rendering"], orderIndex: 2, estimatedTime: "35 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 18, moduleId: 5, title: "Styling in React", objectives: ["Apply CSS to components", "Use CSS modules", "Explore styled-components"], keyConcepts: ["CSS in React", "CSS Modules", "CSS-in-JS"], orderIndex: 3, estimatedTime: "30 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
  // Module 6: Components & Props
  6: [
    { id: 19, moduleId: 6, title: "Understanding Props", objectives: ["Pass data to components", "Use props effectively", "Validate props"], keyConcepts: ["Props", "Data flow", "PropTypes"], orderIndex: 1, estimatedTime: "35 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 20, moduleId: 6, title: "Component Composition", objectives: ["Compose components", "Use children prop", "Create reusable components"], keyConcepts: ["Composition", "Children", "Reusability"], orderIndex: 2, estimatedTime: "40 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 21, moduleId: 6, title: "Conditional Rendering", objectives: ["Render conditionally", "Use ternary operators", "Handle empty states"], keyConcepts: ["Conditional rendering", "Short-circuit evaluation", "Empty states"], orderIndex: 3, estimatedTime: "30 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
  // Module 7: State & Lifecycle
  7: [
    { id: 22, moduleId: 7, title: "Introduction to State", objectives: ["Understand state concept", "Use useState hook", "Update state correctly"], keyConcepts: ["State", "useState", "State updates"], orderIndex: 1, estimatedTime: "35 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 23, moduleId: 7, title: "useEffect Hook", objectives: ["Perform side effects", "Handle cleanup", "Control effect timing"], keyConcepts: ["Side effects", "Cleanup", "Dependencies"], orderIndex: 2, estimatedTime: "40 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 24, moduleId: 7, title: "Lifting State Up", objectives: ["Share state between components", "Identify state location", "Pass callbacks"], keyConcepts: ["State lifting", "Single source of truth", "Callbacks"], orderIndex: 3, estimatedTime: "35 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
  // Module 8: Hooks Deep Dive
  8: [
    { id: 25, moduleId: 8, title: "useContext Hook", objectives: ["Understand context", "Create context providers", "Consume context"], keyConcepts: ["Context API", "Provider pattern", "Global state"], orderIndex: 1, estimatedTime: "40 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 26, moduleId: 8, title: "useReducer Hook", objectives: ["Manage complex state", "Implement reducers", "Dispatch actions"], keyConcepts: ["Reducers", "Actions", "State machines"], orderIndex: 2, estimatedTime: "45 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 27, moduleId: 8, title: "Custom Hooks", objectives: ["Create custom hooks", "Share logic", "Abstract complexity"], keyConcepts: ["Custom hooks", "Logic reuse", "Hook patterns"], orderIndex: 3, estimatedTime: "40 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
  // Add more modules' lessons as needed - keeping it brief for other courses
  9: [
    { id: 28, moduleId: 9, title: "Generic Functions", objectives: ["Create generic functions", "Infer types", "Constrain generics"], keyConcepts: ["Type parameters", "Type inference", "Constraints"], orderIndex: 1, estimatedTime: "40 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 29, moduleId: 9, title: "Generic Classes", objectives: ["Build generic classes", "Use multiple type params", "Generic interfaces"], keyConcepts: ["Generic classes", "Multiple types", "Interfaces"], orderIndex: 2, estimatedTime: "45 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
  10: [
    { id: 30, moduleId: 10, title: "Partial and Required", objectives: ["Use Partial type", "Use Required type", "Combine utility types"], keyConcepts: ["Partial", "Required", "Type manipulation"], orderIndex: 1, estimatedTime: "30 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
    { id: 31, moduleId: 10, title: "Pick and Omit", objectives: ["Select properties", "Exclude properties", "Build new types"], keyConcepts: ["Pick", "Omit", "Type construction"], orderIndex: 2, estimatedTime: "30 min", videoUrl: null, externalResources: [], createdAt: null, updatedAt: null },
  ],
};

// Mock AI notes
export const mockAINotes: Record<number, AINotes> = {
  1: {
    id: 1,
    lessonId: 1,
    content: `<h2>Understanding HTML</h2>
<p>HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using a series of elements.</p>

<h3>Key Points</h3>
<ul>
  <li><strong>HTML elements</strong> are represented by tags, which label pieces of content such as "heading", "paragraph", "table", and so on.</li>
  <li>Browsers do not display HTML tags, but use them to render the content of the page.</li>
  <li>HTML provides the <em>structure</em> of a webpage, while CSS handles the styling and JavaScript handles the behavior.</li>
</ul>

<h3>The Basic Structure</h3>
<p>Every HTML document follows a basic structure:</p>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Page Title&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;My First Heading&lt;/h1&gt;
    &lt;p&gt;My first paragraph.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<h3>Why Learn HTML?</h3>
<p>HTML is the foundation of all websites. Even if you plan to use frameworks like React or Vue, understanding HTML is essential because these frameworks ultimately render HTML to the browser.</p>`,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  16: {
    id: 2,
    lessonId: 16,
    content: `<h2>Introduction to React</h2>
<p>React is a JavaScript library for building user interfaces, particularly single-page applications. It was developed by Facebook and is now maintained by Meta and a community of developers.</p>

<h3>Core Concepts</h3>
<ul>
  <li><strong>Component-Based:</strong> React applications are built using components - self-contained, reusable pieces of UI.</li>
  <li><strong>Virtual DOM:</strong> React uses a virtual DOM to efficiently update the UI without re-rendering everything.</li>
  <li><strong>Declarative:</strong> You describe what the UI should look like, and React handles the updates.</li>
</ul>

<h3>Why React?</h3>
<ol>
  <li>Large ecosystem and community support</li>
  <li>Reusable components save development time</li>
  <li>Excellent performance with virtual DOM</li>
  <li>Strong job market demand</li>
</ol>

<h3>Getting Started</h3>
<p>The easiest way to start with React is using Vite or Create React App:</p>
<pre><code>npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev</code></pre>`,
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-01T09:00:00Z",
  },
};

// Helper to get all lessons as a flat map by lesson ID
export function getAllLessons(): Record<number, Lesson> {
  const allLessons: Record<number, Lesson> = {};
  Object.values(mockLessons).forEach(lessons => {
    lessons.forEach(lesson => {
      allLessons[lesson.id] = lesson;
    });
  });
  return allLessons;
}

// Mock Projects Data
export const mockProjects: Record<number, Project[]> = {
  // Course 1: Web Development
  1: [
    {
      id: 1,
      courseId: 1,
      title: "Personal Portfolio Website",
      description: "Build a responsive personal portfolio website showcasing your skills, projects, and contact information. This project will demonstrate your understanding of HTML, CSS, and responsive design principles.",
      difficulty: "beginner",
      estimatedHours: 8,
      skills: ["HTML5", "CSS3", "Responsive Design", "Git"],
      learningOutcomes: [
        "Create semantic HTML structure for a multi-page website",
        "Apply CSS styling including Flexbox and Grid layouts",
        "Implement responsive design with media queries",
        "Deploy a website to GitHub Pages"
      ],
      requirements: {
        githubRequired: true,
        liveUrlRequired: true,
        documentationRequired: true
      },
      evaluationCriteria: [
        "Clean and semantic HTML structure",
        "Responsive layout that works on mobile and desktop",
        "Consistent styling and visual design",
        "Code organization and documentation",
        "Live deployment and accessibility"
      ],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z"
    },
    {
      id: 2,
      courseId: 1,
      title: "Interactive Quiz Application",
      description: "Create an interactive quiz application using JavaScript. Users should be able to answer questions, see their score, and restart the quiz.",
      difficulty: "intermediate",
      estimatedHours: 6,
      skills: ["JavaScript", "DOM Manipulation", "Event Handling", "CSS"],
      learningOutcomes: [
        "Manipulate DOM elements dynamically with JavaScript",
        "Handle user interactions and events",
        "Implement game logic and state management",
        "Create an engaging user experience"
      ],
      requirements: {
        githubRequired: true,
        liveUrlRequired: true,
        documentationRequired: false
      },
      evaluationCriteria: [
        "Functional quiz with multiple questions",
        "Score tracking and display",
        "Clean and intuitive user interface",
        "Error-free JavaScript code",
        "Restart functionality"
      ],
      createdAt: "2024-01-16T10:00:00Z",
      updatedAt: "2024-01-21T14:30:00Z"
    }
  ],
  // Course 2: React Fundamentals
  2: [
    {
      id: 3,
      courseId: 2,
      title: "Task Management App",
      description: "Build a full-featured task management application using React. Implement CRUD operations, filtering, and local storage persistence.",
      difficulty: "intermediate",
      estimatedHours: 12,
      skills: ["React", "Hooks", "State Management", "Local Storage"],
      learningOutcomes: [
        "Build a complete React application from scratch",
        "Implement CRUD operations for tasks",
        "Use React hooks effectively (useState, useEffect)",
        "Persist data using localStorage"
      ],
      requirements: {
        githubRequired: true,
        liveUrlRequired: true,
        documentationRequired: true
      },
      evaluationCriteria: [
        "Create, read, update, and delete tasks",
        "Filter tasks by status (all, active, completed)",
        "Persist tasks in localStorage",
        "Clean component structure",
        "Responsive design"
      ],
      createdAt: "2024-02-01T09:00:00Z",
      updatedAt: "2024-02-10T11:00:00Z"
    },
    {
      id: 4,
      courseId: 2,
      title: "Weather Dashboard",
      description: "Create a weather dashboard that fetches data from a public API and displays current weather and forecasts for multiple cities.",
      difficulty: "intermediate",
      estimatedHours: 10,
      skills: ["React", "API Integration", "Async/Await", "Data Visualization"],
      learningOutcomes: [
        "Integrate third-party APIs in React",
        "Handle asynchronous data fetching",
        "Display data in a user-friendly format",
        "Implement search functionality"
      ],
      requirements: {
        githubRequired: true,
        liveUrlRequired: true,
        documentationRequired: false
      },
      evaluationCriteria: [
        "Fetch and display weather data",
        "Search for cities",
        "Display forecast information",
        "Handle loading and error states",
        "Clean and intuitive UI"
      ],
      createdAt: "2024-02-05T09:00:00Z",
      updatedAt: "2024-02-15T11:00:00Z"
    }
  ],
  // Course 4: Python for Data Science
  4: [
    {
      id: 5,
      courseId: 4,
      title: "Data Analysis Report",
      description: "Analyze a real-world dataset using Python, NumPy, and Pandas. Create visualizations and document your findings in a Jupyter notebook.",
      difficulty: "beginner",
      estimatedHours: 10,
      skills: ["Python", "Pandas", "NumPy", "Data Visualization"],
      learningOutcomes: [
        "Load and clean data using Pandas",
        "Perform exploratory data analysis",
        "Create meaningful visualizations",
        "Document findings and insights"
      ],
      requirements: {
        githubRequired: true,
        liveUrlRequired: false,
        documentationRequired: true
      },
      evaluationCriteria: [
        "Data cleaning and preprocessing",
        "Statistical analysis",
        "Quality of visualizations",
        "Insights and conclusions",
        "Code organization and documentation"
      ],
      createdAt: "2024-03-01T10:00:00Z",
      updatedAt: "2024-03-05T12:00:00Z"
    }
  ],
  // Course 5: Node.js Backend Development
  5: [
    {
      id: 6,
      courseId: 5,
      title: "RESTful API Server",
      description: "Build a complete RESTful API server with Express.js. Implement authentication, database integration, and proper error handling.",
      difficulty: "advanced",
      estimatedHours: 15,
      skills: ["Node.js", "Express", "MongoDB", "REST APIs", "Authentication"],
      learningOutcomes: [
        "Design and implement RESTful APIs",
        "Connect to MongoDB database",
        "Implement JWT authentication",
        "Handle errors gracefully"
      ],
      requirements: {
        githubRequired: true,
        liveUrlRequired: true,
        documentationRequired: true
      },
      evaluationCriteria: [
        "RESTful endpoint design",
        "Database CRUD operations",
        "Authentication and authorization",
        "Error handling",
        "API documentation"
      ],
      createdAt: "2024-03-10T09:00:00Z",
      updatedAt: "2024-03-15T14:00:00Z"
    }
  ],
  // Course 6: Cloud Architecture with AWS
  6: [
    {
      id: 7,
      courseId: 6,
      title: "Serverless Application",
      description: "Deploy a serverless application using AWS Lambda, API Gateway, and DynamoDB. Implement CI/CD with GitHub Actions.",
      difficulty: "advanced",
      estimatedHours: 20,
      skills: ["AWS Lambda", "API Gateway", "DynamoDB", "CloudFormation", "CI/CD"],
      learningOutcomes: [
        "Design serverless architecture",
        "Deploy Lambda functions",
        "Configure API Gateway",
        "Implement infrastructure as code"
      ],
      requirements: {
        githubRequired: true,
        liveUrlRequired: true,
        documentationRequired: true
      },
      evaluationCriteria: [
        "Serverless architecture design",
        "Lambda function implementation",
        "API Gateway configuration",
        "CloudFormation templates",
        "CI/CD pipeline"
      ],
      createdAt: "2024-03-20T08:00:00Z",
      updatedAt: "2024-03-25T10:00:00Z"
    }
  ]
};

// Helper to get all projects as a flat map by project ID
export function getAllProjects(): Record<number, Project> {
  const allProjects: Record<number, Project> = {};
  Object.values(mockProjects).forEach(projects => {
    projects.forEach(project => {
      allProjects[project.id] = project;
    });
  });
  return allProjects;
}

// Mock Tests Data
export const mockTests: Record<number, TestWithQuestions[]> = {
  // Course 1: Web Development
  1: [
    {
      id: 1,
      courseId: 1,
      title: "HTML & CSS Fundamentals",
      description: "Test your understanding of HTML structure, CSS styling, and responsive design principles.",
      instructions: "Read each question carefully. Select the best answer for each multiple-choice question. You cannot go back once you submit the test.",
      passingPercentage: 70,
      timeLimit: 15,
      questionCount: 5,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z",
      questions: [
        {
          id: "q1-1",
          type: "mcq",
          difficulty: "easy",
          questionText: "Which HTML tag is used to define the main heading of a document?",
          options: [
            { id: "q1-1-a", text: "<header>", isCorrect: false },
            { id: "q1-1-b", text: "<h1>", isCorrect: true },
            { id: "q1-1-c", text: "<head>", isCorrect: false },
            { id: "q1-1-d", text: "<title>", isCorrect: false }
          ]
        },
        {
          id: "q1-2",
          type: "mcq",
          difficulty: "easy",
          questionText: "What does CSS stand for?",
          options: [
            { id: "q1-2-a", text: "Computer Style Sheets", isCorrect: false },
            { id: "q1-2-b", text: "Creative Style System", isCorrect: false },
            { id: "q1-2-c", text: "Cascading Style Sheets", isCorrect: true },
            { id: "q1-2-d", text: "Colorful Style Sheets", isCorrect: false }
          ]
        },
        {
          id: "q1-3",
          type: "mcq",
          difficulty: "medium",
          questionText: "Which CSS property is used to create space between the element's border and its content?",
          options: [
            { id: "q1-3-a", text: "margin", isCorrect: false },
            { id: "q1-3-b", text: "padding", isCorrect: true },
            { id: "q1-3-c", text: "spacing", isCorrect: false },
            { id: "q1-3-d", text: "border-spacing", isCorrect: false }
          ]
        },
        {
          id: "q1-4",
          type: "mcq",
          difficulty: "medium",
          questionText: "Which display value creates a flex container?",
          options: [
            { id: "q1-4-a", text: "display: block", isCorrect: false },
            { id: "q1-4-b", text: "display: inline", isCorrect: false },
            { id: "q1-4-c", text: "display: flex", isCorrect: true },
            { id: "q1-4-d", text: "display: grid-flex", isCorrect: false }
          ]
        },
        {
          id: "q1-5",
          type: "mcq",
          difficulty: "hard",
          questionText: "Which media query correctly targets screens smaller than 768px?",
          options: [
            { id: "q1-5-a", text: "@media (min-width: 768px)", isCorrect: false },
            { id: "q1-5-b", text: "@media (max-width: 768px)", isCorrect: true },
            { id: "q1-5-c", text: "@media (width < 768px)", isCorrect: false },
            { id: "q1-5-d", text: "@media screen(768px)", isCorrect: false }
          ]
        }
      ]
    },
    {
      id: 2,
      courseId: 1,
      title: "JavaScript Basics",
      description: "Evaluate your JavaScript knowledge including variables, functions, and DOM manipulation.",
      instructions: "This test covers JavaScript fundamentals. Take your time and think through each question.",
      passingPercentage: 70,
      timeLimit: 20,
      questionCount: 5,
      createdAt: "2024-01-16T10:00:00Z",
      updatedAt: "2024-01-21T14:30:00Z",
      questions: [
        {
          id: "q2-1",
          type: "mcq",
          difficulty: "easy",
          questionText: "Which keyword is used to declare a constant in JavaScript?",
          options: [
            { id: "q2-1-a", text: "var", isCorrect: false },
            { id: "q2-1-b", text: "let", isCorrect: false },
            { id: "q2-1-c", text: "const", isCorrect: true },
            { id: "q2-1-d", text: "constant", isCorrect: false }
          ]
        },
        {
          id: "q2-2",
          type: "mcq",
          difficulty: "easy",
          questionText: "What is the correct syntax for an arrow function?",
          options: [
            { id: "q2-2-a", text: "function => ()", isCorrect: false },
            { id: "q2-2-b", text: "() => {}", isCorrect: true },
            { id: "q2-2-c", text: "=> function()", isCorrect: false },
            { id: "q2-2-d", text: "arrow() => {}", isCorrect: false }
          ]
        },
        {
          id: "q2-3",
          type: "mcq",
          difficulty: "medium",
          questionText: "Which method is used to select an element by its ID?",
          options: [
            { id: "q2-3-a", text: "document.querySelector('#id')", isCorrect: false },
            { id: "q2-3-b", text: "document.getElement('id')", isCorrect: false },
            { id: "q2-3-c", text: "document.getElementById('id')", isCorrect: true },
            { id: "q2-3-d", text: "document.findById('id')", isCorrect: false }
          ]
        },
        {
          id: "q2-4",
          type: "mcq",
          difficulty: "medium",
          questionText: "What does the 'this' keyword refer to in an arrow function?",
          options: [
            { id: "q2-4-a", text: "The function itself", isCorrect: false },
            { id: "q2-4-b", text: "The global object always", isCorrect: false },
            { id: "q2-4-c", text: "The enclosing lexical context", isCorrect: true },
            { id: "q2-4-d", text: "undefined", isCorrect: false }
          ]
        },
        {
          id: "q2-5",
          type: "scenario",
          difficulty: "hard",
          questionText: "You need to add a click event listener to a button. Which code is correct?",
          options: [
            { id: "q2-5-a", text: "button.onClick = function() {}", isCorrect: false },
            { id: "q2-5-b", text: "button.addEventListener('click', function() {})", isCorrect: true },
            { id: "q2-5-c", text: "button.on('click', function() {})", isCorrect: false },
            { id: "q2-5-d", text: "button.listen('click', function() {})", isCorrect: false }
          ]
        }
      ]
    }
  ],
  // Course 2: React Fundamentals
  2: [
    {
      id: 3,
      courseId: 2,
      title: "React Core Concepts",
      description: "Test your understanding of React components, props, state, and hooks.",
      instructions: "This test evaluates your knowledge of React fundamentals. Each question has only one correct answer.",
      passingPercentage: 75,
      timeLimit: 25,
      questionCount: 6,
      createdAt: "2024-02-01T09:00:00Z",
      updatedAt: "2024-02-10T11:00:00Z",
      questions: [
        {
          id: "q3-1",
          type: "mcq",
          difficulty: "easy",
          questionText: "What is the correct way to create a functional component in React?",
          options: [
            { id: "q3-1-a", text: "function MyComponent() { return <div></div> }", isCorrect: true },
            { id: "q3-1-b", text: "class MyComponent { render() {} }", isCorrect: false },
            { id: "q3-1-c", text: "const MyComponent = component(<div></div>)", isCorrect: false },
            { id: "q3-1-d", text: "React.function MyComponent() {}", isCorrect: false }
          ]
        },
        {
          id: "q3-2",
          type: "mcq",
          difficulty: "easy",
          questionText: "How do you pass a prop called 'name' to a component?",
          options: [
            { id: "q3-2-a", text: "<Component props={name} />", isCorrect: false },
            { id: "q3-2-b", text: "<Component name='value' />", isCorrect: true },
            { id: "q3-2-c", text: "<Component {name} />", isCorrect: false },
            { id: "q3-2-d", text: "<Component prop:name='value' />", isCorrect: false }
          ]
        },
        {
          id: "q3-3",
          type: "mcq",
          difficulty: "medium",
          questionText: "What hook is used to manage state in a functional component?",
          options: [
            { id: "q3-3-a", text: "useEffect", isCorrect: false },
            { id: "q3-3-b", text: "useContext", isCorrect: false },
            { id: "q3-3-c", text: "useState", isCorrect: true },
            { id: "q3-3-d", text: "useReducer", isCorrect: false }
          ]
        },
        {
          id: "q3-4",
          type: "mcq",
          difficulty: "medium",
          questionText: "What is the purpose of the useEffect hook?",
          options: [
            { id: "q3-4-a", text: "To manage component state", isCorrect: false },
            { id: "q3-4-b", text: "To perform side effects in components", isCorrect: true },
            { id: "q3-4-c", text: "To create context providers", isCorrect: false },
            { id: "q3-4-d", text: "To optimize rendering performance", isCorrect: false }
          ]
        },
        {
          id: "q3-5",
          type: "mcq",
          difficulty: "hard",
          questionText: "What happens when you pass an empty dependency array [] to useEffect?",
          options: [
            { id: "q3-5-a", text: "The effect runs on every render", isCorrect: false },
            { id: "q3-5-b", text: "The effect never runs", isCorrect: false },
            { id: "q3-5-c", text: "The effect runs only once after initial mount", isCorrect: true },
            { id: "q3-5-d", text: "The effect runs when props change", isCorrect: false }
          ]
        },
        {
          id: "q3-6",
          type: "scenario",
          difficulty: "hard",
          questionText: "You have two sibling components that need to share state. What is the recommended approach?",
          options: [
            { id: "q3-6-a", text: "Use localStorage to share data", isCorrect: false },
            { id: "q3-6-b", text: "Lift the state up to the common parent", isCorrect: true },
            { id: "q3-6-c", text: "Use document.querySelector to access the other component", isCorrect: false },
            { id: "q3-6-d", text: "Create a global variable", isCorrect: false }
          ]
        }
      ]
    }
  ],
  // Course 3: TypeScript
  3: [
    {
      id: 4,
      courseId: 3,
      title: "TypeScript Advanced Types",
      description: "Evaluate your understanding of TypeScript generics, utility types, and type manipulation.",
      instructions: "This advanced test covers TypeScript type system features. Think carefully about each question.",
      passingPercentage: 80,
      timeLimit: 30,
      questionCount: 5,
      createdAt: "2024-02-15T08:00:00Z",
      updatedAt: "2024-02-20T16:00:00Z",
      questions: [
        {
          id: "q4-1",
          type: "mcq",
          difficulty: "medium",
          questionText: "What utility type makes all properties optional?",
          options: [
            { id: "q4-1-a", text: "Required<T>", isCorrect: false },
            { id: "q4-1-b", text: "Partial<T>", isCorrect: true },
            { id: "q4-1-c", text: "Optional<T>", isCorrect: false },
            { id: "q4-1-d", text: "Maybe<T>", isCorrect: false }
          ]
        },
        {
          id: "q4-2",
          type: "mcq",
          difficulty: "medium",
          questionText: "How do you define a generic function in TypeScript?",
          options: [
            { id: "q4-2-a", text: "function fn<T>(arg: T): T {}", isCorrect: true },
            { id: "q4-2-b", text: "function fn(arg: generic): generic {}", isCorrect: false },
            { id: "q4-2-c", text: "function fn[T](arg: T): T {}", isCorrect: false },
            { id: "q4-2-d", text: "generic function fn(arg): {}", isCorrect: false }
          ]
        },
        {
          id: "q4-3",
          type: "mcq",
          difficulty: "hard",
          questionText: "What does Pick<Type, Keys> do?",
          options: [
            { id: "q4-3-a", text: "Removes the specified keys from the type", isCorrect: false },
            { id: "q4-3-b", text: "Creates a type with only the specified keys", isCorrect: true },
            { id: "q4-3-c", text: "Makes the specified keys optional", isCorrect: false },
            { id: "q4-3-d", text: "Makes the specified keys required", isCorrect: false }
          ]
        },
        {
          id: "q4-4",
          type: "mcq",
          difficulty: "hard",
          questionText: "What is the difference between 'interface' and 'type' in TypeScript?",
          options: [
            { id: "q4-4-a", text: "They are completely interchangeable", isCorrect: false },
            { id: "q4-4-b", text: "Interfaces can be merged, types cannot", isCorrect: true },
            { id: "q4-4-c", text: "Types can extend classes, interfaces cannot", isCorrect: false },
            { id: "q4-4-d", text: "Interfaces are faster to compile", isCorrect: false }
          ]
        },
        {
          id: "q4-5",
          type: "scenario",
          difficulty: "hard",
          questionText: "You need a type that excludes null and undefined from T. Which utility type should you use?",
          options: [
            { id: "q4-5-a", text: "Required<T>", isCorrect: false },
            { id: "q4-5-b", text: "NonNullable<T>", isCorrect: true },
            { id: "q4-5-c", text: "Exclude<T, null>", isCorrect: false },
            { id: "q4-5-d", text: "Strict<T>", isCorrect: false }
          ]
        }
      ]
    }
  ],
  // Course 4: Python
  4: [
    {
      id: 5,
      courseId: 4,
      title: "Python Data Science Basics",
      description: "Test your knowledge of Python, NumPy, and Pandas for data analysis.",
      instructions: "This test covers Python fundamentals and data science libraries. Select the best answer for each question.",
      passingPercentage: 70,
      timeLimit: 20,
      questionCount: 5,
      createdAt: "2024-03-01T10:00:00Z",
      updatedAt: "2024-03-05T12:00:00Z",
      questions: [
        {
          id: "q5-1",
          type: "mcq",
          difficulty: "easy",
          questionText: "Which library is used to create DataFrames in Python?",
          options: [
            { id: "q5-1-a", text: "NumPy", isCorrect: false },
            { id: "q5-1-b", text: "Matplotlib", isCorrect: false },
            { id: "q5-1-c", text: "Pandas", isCorrect: true },
            { id: "q5-1-d", text: "SciPy", isCorrect: false }
          ]
        },
        {
          id: "q5-2",
          type: "mcq",
          difficulty: "easy",
          questionText: "How do you import NumPy with the alias 'np'?",
          options: [
            { id: "q5-2-a", text: "import numpy as np", isCorrect: true },
            { id: "q5-2-b", text: "from numpy import np", isCorrect: false },
            { id: "q5-2-c", text: "import np from numpy", isCorrect: false },
            { id: "q5-2-d", text: "use numpy as np", isCorrect: false }
          ]
        },
        {
          id: "q5-3",
          type: "mcq",
          difficulty: "medium",
          questionText: "Which Pandas method is used to read a CSV file?",
          options: [
            { id: "q5-3-a", text: "pd.load_csv()", isCorrect: false },
            { id: "q5-3-b", text: "pd.read_csv()", isCorrect: true },
            { id: "q5-3-c", text: "pd.open_csv()", isCorrect: false },
            { id: "q5-3-d", text: "pd.csv()", isCorrect: false }
          ]
        },
        {
          id: "q5-4",
          type: "mcq",
          difficulty: "medium",
          questionText: "What does df.head() return?",
          options: [
            { id: "q5-4-a", text: "The first row of the DataFrame", isCorrect: false },
            { id: "q5-4-b", text: "The first 5 rows of the DataFrame", isCorrect: true },
            { id: "q5-4-c", text: "The column names", isCorrect: false },
            { id: "q5-4-d", text: "The data types of each column", isCorrect: false }
          ]
        },
        {
          id: "q5-5",
          type: "mcq",
          difficulty: "hard",
          questionText: "Which NumPy function calculates the standard deviation?",
          options: [
            { id: "q5-5-a", text: "np.std()", isCorrect: true },
            { id: "q5-5-b", text: "np.deviation()", isCorrect: false },
            { id: "q5-5-c", text: "np.stddev()", isCorrect: false },
            { id: "q5-5-d", text: "np.sd()", isCorrect: false }
          ]
        }
      ]
    }
  ],
  // Course 5: Node.js
  5: [
    {
      id: 6,
      courseId: 5,
      title: "Node.js & Express Fundamentals",
      description: "Evaluate your knowledge of Node.js backend development with Express.",
      instructions: "This test covers Node.js and Express concepts for building backend applications.",
      passingPercentage: 75,
      timeLimit: 25,
      questionCount: 5,
      createdAt: "2024-03-10T09:00:00Z",
      updatedAt: "2024-03-15T14:00:00Z",
      questions: [
        {
          id: "q6-1",
          type: "mcq",
          difficulty: "easy",
          questionText: "What is Express.js?",
          options: [
            { id: "q6-1-a", text: "A database management system", isCorrect: false },
            { id: "q6-1-b", text: "A web application framework for Node.js", isCorrect: true },
            { id: "q6-1-c", text: "A frontend JavaScript library", isCorrect: false },
            { id: "q6-1-d", text: "A testing framework", isCorrect: false }
          ]
        },
        {
          id: "q6-2",
          type: "mcq",
          difficulty: "easy",
          questionText: "Which HTTP method is used to retrieve data?",
          options: [
            { id: "q6-2-a", text: "POST", isCorrect: false },
            { id: "q6-2-b", text: "GET", isCorrect: true },
            { id: "q6-2-c", text: "PUT", isCorrect: false },
            { id: "q6-2-d", text: "DELETE", isCorrect: false }
          ]
        },
        {
          id: "q6-3",
          type: "mcq",
          difficulty: "medium",
          questionText: "What is middleware in Express?",
          options: [
            { id: "q6-3-a", text: "A database connection", isCorrect: false },
            { id: "q6-3-b", text: "Functions that execute during request-response cycle", isCorrect: true },
            { id: "q6-3-c", text: "A type of HTTP request", isCorrect: false },
            { id: "q6-3-d", text: "A frontend component", isCorrect: false }
          ]
        },
        {
          id: "q6-4",
          type: "mcq",
          difficulty: "medium",
          questionText: "How do you access the request body in Express?",
          options: [
            { id: "q6-4-a", text: "req.data", isCorrect: false },
            { id: "q6-4-b", text: "req.body", isCorrect: true },
            { id: "q6-4-c", text: "req.content", isCorrect: false },
            { id: "q6-4-d", text: "req.payload", isCorrect: false }
          ]
        },
        {
          id: "q6-5",
          type: "scenario",
          difficulty: "hard",
          questionText: "You need to handle errors globally in Express. What is the correct middleware signature?",
          options: [
            { id: "q6-5-a", text: "app.use((req, res) => {})", isCorrect: false },
            { id: "q6-5-b", text: "app.use((err, req, res, next) => {})", isCorrect: true },
            { id: "q6-5-c", text: "app.error((err, res) => {})", isCorrect: false },
            { id: "q6-5-d", text: "app.catch((err) => {})", isCorrect: false }
          ]
        }
      ]
    }
  ],
  // Course 6: AWS
  6: [
    {
      id: 7,
      courseId: 6,
      title: "AWS Cloud Fundamentals",
      description: "Test your knowledge of AWS services, architecture, and best practices.",
      instructions: "This test covers AWS cloud concepts. Choose the most appropriate answer for each question.",
      passingPercentage: 75,
      timeLimit: 30,
      questionCount: 5,
      createdAt: "2024-03-20T08:00:00Z",
      updatedAt: "2024-03-25T10:00:00Z",
      questions: [
        {
          id: "q7-1",
          type: "mcq",
          difficulty: "easy",
          questionText: "What AWS service is used for object storage?",
          options: [
            { id: "q7-1-a", text: "EC2", isCorrect: false },
            { id: "q7-1-b", text: "RDS", isCorrect: false },
            { id: "q7-1-c", text: "S3", isCorrect: true },
            { id: "q7-1-d", text: "Lambda", isCorrect: false }
          ]
        },
        {
          id: "q7-2",
          type: "mcq",
          difficulty: "easy",
          questionText: "What does EC2 stand for?",
          options: [
            { id: "q7-2-a", text: "Elastic Cloud Computing", isCorrect: false },
            { id: "q7-2-b", text: "Elastic Compute Cloud", isCorrect: true },
            { id: "q7-2-c", text: "Enterprise Cloud Cluster", isCorrect: false },
            { id: "q7-2-d", text: "Extended Compute Capacity", isCorrect: false }
          ]
        },
        {
          id: "q7-3",
          type: "mcq",
          difficulty: "medium",
          questionText: "Which AWS service allows you to run code without provisioning servers?",
          options: [
            { id: "q7-3-a", text: "EC2", isCorrect: false },
            { id: "q7-3-b", text: "ECS", isCorrect: false },
            { id: "q7-3-c", text: "Lambda", isCorrect: true },
            { id: "q7-3-d", text: "Elastic Beanstalk", isCorrect: false }
          ]
        },
        {
          id: "q7-4",
          type: "mcq",
          difficulty: "medium",
          questionText: "What is CloudFormation used for?",
          options: [
            { id: "q7-4-a", text: "Monitoring application performance", isCorrect: false },
            { id: "q7-4-b", text: "Infrastructure as Code", isCorrect: true },
            { id: "q7-4-c", text: "Container orchestration", isCorrect: false },
            { id: "q7-4-d", text: "Database management", isCorrect: false }
          ]
        },
        {
          id: "q7-5",
          type: "scenario",
          difficulty: "hard",
          questionText: "You need a fully managed NoSQL database that scales automatically. Which AWS service should you use?",
          options: [
            { id: "q7-5-a", text: "RDS", isCorrect: false },
            { id: "q7-5-b", text: "DynamoDB", isCorrect: true },
            { id: "q7-5-c", text: "Aurora", isCorrect: false },
            { id: "q7-5-d", text: "ElastiCache", isCorrect: false }
          ]
        }
      ]
    }
  ]
};

// Helper to get all tests as a flat map by test ID
export function getAllTests(): Record<number, TestWithQuestions> {
  const allTests: Record<number, TestWithQuestions> = {};
  Object.values(mockTests).forEach(tests => {
    tests.forEach(test => {
      allTests[test.id] = test;
    });
  });
  return allTests;
}
