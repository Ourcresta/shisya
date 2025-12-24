import { useMemo } from "react";
import { Sparkles } from "lucide-react";

interface Quote {
  text: string;
  author?: string;
}

const motivationalQuotes: Quote[] = [
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "Every accomplishment starts with the decision to try." },
  { text: "Your limitation is only your imagination." },
  { text: "Push yourself, because no one else is going to do it for you." },
  { text: "Great things never come from comfort zones." },
  { text: "Dream it. Wish it. Do it." },
  { text: "Success doesn't just find you. You have to go out and get it." },
  { text: "The harder you work for something, the greater you'll feel when you achieve it." },
  { text: "Don't stop when you're tired. Stop when you're done." },
  { text: "Wake up with determination. Go to bed with satisfaction." },
  { text: "Do something today that your future self will thank you for." },
  { text: "Little things make big days." },
  { text: "It's going to be hard, but hard does not mean impossible." },
  { text: "Don't wait for opportunity. Create it." },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths." },
  { text: "The key to success is to focus on goals, not obstacles." },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In learning you will teach, and in teaching you will learn.", author: "Phil Collins" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
  { text: "The mind is not a vessel to be filled but a fire to be ignited.", author: "Plutarch" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Consistency is more important than perfection." },
  { text: "One day or day one. You decide." },
  { text: "Focus on progress, not perfection." },
  { text: "Every expert was once a beginner. Keep going." },
];

function getRandomQuote(): Quote {
  const now = new Date();
  const currentHour = `${now.toDateString()}-${now.getHours()}`;
  const storedData = localStorage.getItem("motivation_quote");
  
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      if (parsed.hour === currentHour && parsed.quote) {
        return parsed.quote;
      }
    } catch {
      // Invalid data, get new quote
    }
  }
  
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  const quote = motivationalQuotes[randomIndex];
  
  localStorage.setItem("motivation_quote", JSON.stringify({
    hour: currentHour,
    quote: quote
  }));
  
  return quote;
}

interface MotivationBannerProps {
  className?: string;
}

export default function MotivationBanner({ className = "" }: MotivationBannerProps) {
  const quote = useMemo(() => getRandomQuote(), []);

  return (
    <div 
      className={`relative overflow-hidden rounded-md bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10 border border-primary/10 ${className}`}
      data-testid="motivation-banner"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p 
            className="text-sm italic text-muted-foreground leading-relaxed"
            data-testid="text-motivation-quote"
          >
            "{quote.text}"
            {quote.author && (
              <span className="ml-2 text-xs font-normal not-italic opacity-70">
                — {quote.author}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
