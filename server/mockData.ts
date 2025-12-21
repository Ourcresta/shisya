import type { Course, Module, Lesson, AINotes } from "@shared/schema";

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
