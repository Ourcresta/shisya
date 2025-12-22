import type { Lab } from "@shared/schema";

// Mock Labs Data - 6-8 labs per course focusing on JavaScript practice
export const mockLabs: Record<number, Lab[]> = {
  // Course 1: Introduction to Web Development
  1: [
    {
      id: 1,
      courseId: 1,
      moduleId: 3,
      lessonId: 9,
      title: "Variables and Output",
      description: "Practice declaring variables and printing output to the console.",
      difficulty: "beginner",
      instructions: [
        "Declare a variable called 'greeting' and set it to 'Hello, World!'",
        "Declare a variable called 'number' and set it to 42",
        "Use console.log() to print the greeting",
        "Use console.log() to print the number"
      ],
      starterCode: `// Declare your variables below
// greeting should be "Hello, World!"
// number should be 42

// Print the greeting

// Print the number
`,
      expectedOutput: "Hello, World!\n42",
      language: "javascript",
      status: "available",
      estimatedTime: 5,
      orderIndex: 1
    },
    {
      id: 2,
      courseId: 1,
      moduleId: 3,
      lessonId: 9,
      title: "Basic Math Operations",
      description: "Practice arithmetic operations in JavaScript.",
      difficulty: "beginner",
      instructions: [
        "Create two variables: a = 10 and b = 5",
        "Calculate and log the sum of a and b",
        "Calculate and log the product of a and b",
        "Calculate and log a divided by b"
      ],
      starterCode: `// Declare variables a and b

// Calculate and log the sum

// Calculate and log the product

// Calculate and log the division
`,
      expectedOutput: "15\n50\n2",
      language: "javascript",
      status: "available",
      estimatedTime: 5,
      orderIndex: 2
    },
    {
      id: 3,
      courseId: 1,
      moduleId: 3,
      lessonId: 10,
      title: "Creating Functions",
      description: "Practice writing and calling functions.",
      difficulty: "beginner",
      instructions: [
        "Create a function called 'greet' that takes a name parameter",
        "The function should return 'Hello, [name]!'",
        "Call the function with 'Alice' and log the result",
        "Call the function with 'Bob' and log the result"
      ],
      starterCode: `// Create the greet function


// Call greet with 'Alice' and log it

// Call greet with 'Bob' and log it
`,
      expectedOutput: "Hello, Alice!\nHello, Bob!",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 3
    },
    {
      id: 4,
      courseId: 1,
      moduleId: 3,
      lessonId: 12,
      title: "Working with Arrays",
      description: "Practice creating and manipulating arrays.",
      difficulty: "intermediate",
      instructions: [
        "Create an array called 'fruits' with: 'apple', 'banana', 'orange'",
        "Log the first element of the array",
        "Log the length of the array",
        "Add 'grape' to the end of the array",
        "Log the updated array"
      ],
      starterCode: `// Create the fruits array

// Log the first element

// Log the length

// Add 'grape' to the array

// Log the updated array
`,
      expectedOutput: "apple\n3\n[\"apple\", \"banana\", \"orange\", \"grape\"]",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 4
    },
    {
      id: 5,
      courseId: 1,
      moduleId: 3,
      lessonId: 12,
      title: "Array Methods - Map",
      description: "Practice using the map method to transform arrays.",
      difficulty: "intermediate",
      instructions: [
        "Create an array called 'numbers' with values [1, 2, 3, 4, 5]",
        "Use map() to create a new array 'doubled' with each number multiplied by 2",
        "Log the doubled array"
      ],
      starterCode: `// Create the numbers array
const numbers = [1, 2, 3, 4, 5];

// Use map to double each number

// Log the doubled array
`,
      expectedOutput: "[2, 4, 6, 8, 10]",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 5
    },
    {
      id: 6,
      courseId: 1,
      moduleId: 3,
      lessonId: 12,
      title: "Array Methods - Filter",
      description: "Practice using the filter method to select elements.",
      difficulty: "intermediate",
      instructions: [
        "Given the numbers array [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
        "Use filter() to create 'evenNumbers' containing only even numbers",
        "Log the evenNumbers array"
      ],
      starterCode: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Use filter to get even numbers

// Log the even numbers
`,
      expectedOutput: "[2, 4, 6, 8, 10]",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 6
    },
    {
      id: 7,
      courseId: 1,
      moduleId: 3,
      lessonId: 12,
      title: "Working with Objects",
      description: "Practice creating and accessing object properties.",
      difficulty: "intermediate",
      instructions: [
        "Create an object called 'person' with properties: name ('John'), age (30), city ('New York')",
        "Log the person's name",
        "Log the person's age",
        "Add a new property 'occupation' with value 'Developer'",
        "Log the entire person object"
      ],
      starterCode: `// Create the person object

// Log the name

// Log the age

// Add occupation property

// Log the entire object
`,
      expectedOutput: "John\n30\n{\n  \"name\": \"John\",\n  \"age\": 30,\n  \"city\": \"New York\",\n  \"occupation\": \"Developer\"\n}",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 7
    },
    {
      id: 8,
      courseId: 1,
      moduleId: 3,
      lessonId: 12,
      title: "Simple Algorithm: Find Maximum",
      description: "Write a function to find the maximum value in an array.",
      difficulty: "advanced",
      instructions: [
        "Create a function called 'findMax' that takes an array of numbers",
        "The function should return the largest number in the array",
        "Test with [3, 7, 2, 9, 1] and log the result",
        "Test with [100, 50, 75] and log the result"
      ],
      starterCode: `// Create the findMax function
function findMax(arr) {
  // Your code here
}

// Test with [3, 7, 2, 9, 1]
console.log(findMax([3, 7, 2, 9, 1]));

// Test with [100, 50, 75]
console.log(findMax([100, 50, 75]));
`,
      expectedOutput: "9\n100",
      language: "javascript",
      status: "available",
      estimatedTime: 15,
      orderIndex: 8
    }
  ],
  
  // Course 2: React Fundamentals
  2: [
    {
      id: 9,
      courseId: 2,
      moduleId: 5,
      lessonId: 16,
      title: "Arrow Functions",
      description: "Practice using arrow function syntax in JavaScript.",
      difficulty: "beginner",
      instructions: [
        "Convert the regular function to an arrow function",
        "Create an arrow function 'multiply' that takes two parameters and returns their product",
        "Test multiply(3, 4) and log the result"
      ],
      starterCode: `// Convert this to an arrow function and call it
function add(a, b) {
  return a + b;
}
console.log(add(2, 3));

// Create the multiply arrow function

// Test multiply(3, 4)
`,
      expectedOutput: "5\n12",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 1
    },
    {
      id: 10,
      courseId: 2,
      moduleId: 5,
      lessonId: 17,
      title: "Destructuring Objects",
      description: "Practice object destructuring syntax.",
      difficulty: "beginner",
      instructions: [
        "Given the user object, use destructuring to extract name and email",
        "Log the extracted name",
        "Log the extracted email"
      ],
      starterCode: `const user = {
  name: "Alice",
  email: "alice@example.com",
  age: 28
};

// Use destructuring to extract name and email

// Log the name

// Log the email
`,
      expectedOutput: "Alice\nalice@example.com",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 2
    },
    {
      id: 11,
      courseId: 2,
      moduleId: 6,
      lessonId: 19,
      title: "Spread Operator",
      description: "Practice using the spread operator with arrays and objects.",
      difficulty: "intermediate",
      instructions: [
        "Create an array 'arr1' with [1, 2, 3]",
        "Create an array 'arr2' with [4, 5, 6]",
        "Use spread operator to create 'combined' containing all elements",
        "Log the combined array"
      ],
      starterCode: `// Create arr1
const arr1 = [1, 2, 3];

// Create arr2
const arr2 = [4, 5, 6];

// Use spread to combine them

// Log combined array
`,
      expectedOutput: "[1, 2, 3, 4, 5, 6]",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 3
    },
    {
      id: 12,
      courseId: 2,
      moduleId: 7,
      lessonId: 22,
      title: "Array Reduce",
      description: "Practice using reduce to aggregate values.",
      difficulty: "intermediate",
      instructions: [
        "Given an array of numbers [10, 20, 30, 40, 50]",
        "Use reduce() to calculate the sum of all numbers",
        "Log the sum"
      ],
      starterCode: `const numbers = [10, 20, 30, 40, 50];

// Use reduce to calculate the sum

// Log the sum
`,
      expectedOutput: "150",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 4
    },
    {
      id: 13,
      courseId: 2,
      moduleId: 7,
      lessonId: 23,
      title: "Async/Await Basics",
      description: "Practice async/await with a simulated delay.",
      difficulty: "intermediate",
      instructions: [
        "Create an async function that returns 'Data loaded!'",
        "Call the function and log the result",
        "Note: For this lab, we'll use synchronous code to simulate async patterns"
      ],
      starterCode: `// Create a function that returns a Promise
function fetchData() {
  return Promise.resolve("Data loaded!");
}

// Call fetchData and log the result
fetchData().then(result => console.log(result));
`,
      expectedOutput: "Data loaded!",
      language: "javascript",
      status: "available",
      estimatedTime: 15,
      orderIndex: 5
    },
    {
      id: 14,
      courseId: 2,
      moduleId: 8,
      lessonId: 27,
      title: "Higher Order Functions",
      description: "Practice creating functions that take other functions as arguments.",
      difficulty: "advanced",
      instructions: [
        "Create a function 'applyOperation' that takes a number and a function",
        "The function should apply the given function to the number",
        "Test with a 'double' function that doubles the number",
        "Test with a 'square' function that squares the number"
      ],
      starterCode: `// Create the applyOperation function
function applyOperation(num, operation) {
  // Your code here
}

// Create double function
const double = (x) => x * 2;

// Create square function
const square = (x) => x * x;

// Test applyOperation with double(5)
console.log(applyOperation(5, double));

// Test applyOperation with square(4)
console.log(applyOperation(4, square));
`,
      expectedOutput: "10\n16",
      language: "javascript",
      status: "available",
      estimatedTime: 15,
      orderIndex: 6
    }
  ],
  
  // Course 3: Advanced TypeScript (JavaScript labs for practice)
  3: [
    {
      id: 15,
      courseId: 3,
      moduleId: 9,
      lessonId: 28,
      title: "Generic-like Patterns in JS",
      description: "Practice patterns that prepare you for TypeScript generics.",
      difficulty: "intermediate",
      instructions: [
        "Create a function 'identity' that returns whatever you pass to it",
        "Test with a number (42)",
        "Test with a string ('hello')",
        "Test with an array ([1, 2, 3])"
      ],
      starterCode: `// Create the identity function
function identity(value) {
  // Your code here
}

// Test with number
console.log(identity(42));

// Test with string
console.log(identity("hello"));

// Test with array
console.log(identity([1, 2, 3]));
`,
      expectedOutput: "42\nhello\n[1, 2, 3]",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 1
    },
    {
      id: 16,
      courseId: 3,
      moduleId: 10,
      lessonId: 30,
      title: "Object Property Access",
      description: "Practice dynamic property access patterns.",
      difficulty: "intermediate",
      instructions: [
        "Create a function 'pick' that takes an object and a key",
        "The function should return the value at that key",
        "Test with person object and 'name' key",
        "Test with person object and 'age' key"
      ],
      starterCode: `// Create the pick function
function pick(obj, key) {
  // Your code here
}

const person = { name: "Alice", age: 30, city: "NYC" };

// Test with 'name'
console.log(pick(person, "name"));

// Test with 'age'
console.log(pick(person, "age"));
`,
      expectedOutput: "Alice\n30",
      language: "javascript",
      status: "available",
      estimatedTime: 10,
      orderIndex: 2
    },
    {
      id: 17,
      courseId: 3,
      moduleId: 10,
      lessonId: 31,
      title: "Object Transformation",
      description: "Practice transforming object structures.",
      difficulty: "advanced",
      instructions: [
        "Create a function 'omit' that takes an object and an array of keys",
        "Return a new object without those keys",
        "Test by omitting 'password' from a user object"
      ],
      starterCode: `// Create the omit function
function omit(obj, keysToOmit) {
  // Your code here - hint: use Object.keys and filter
}

const user = { id: 1, name: "John", password: "secret123", email: "john@test.com" };

// Omit password and log result
console.log(omit(user, ["password"]));
`,
      expectedOutput: "{\n  \"id\": 1,\n  \"name\": \"John\",\n  \"email\": \"john@test.com\"\n}",
      language: "javascript",
      status: "available",
      estimatedTime: 15,
      orderIndex: 3
    }
  ]
};

// Get labs for a specific course
export function getCourseLabs(courseId: number): Lab[] {
  return mockLabs[courseId] || [];
}

// Get a specific lab
export function getLab(labId: number): Lab | undefined {
  for (const labs of Object.values(mockLabs)) {
    const lab = labs.find(l => l.id === labId);
    if (lab) return lab;
  }
  return undefined;
}

// Get all labs as a flat list
export function getAllLabs(): Lab[] {
  return Object.values(mockLabs).flat();
}
