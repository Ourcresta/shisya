import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Coins, 
  Plus, 
  BookOpen, 
  Award, 
  Gift, 
  Ticket,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Info,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Wallet as WalletIcon,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Package
} from "lucide-react";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { useCredits } from "@/contexts/CreditContext";
import { useAuth } from "@/contexts/AuthContext";
import type { CreditTransaction } from "@shared/schema";

const creditPacks = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 500,
    points: 500,
    bonus: 0,
    description: "Best for beginners",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: 1000,
    points: 1100,
    bonus: 10,
    description: "+10% bonus points",
    popular: false,
  },
  {
    id: "power",
    name: "Power Pack",
    price: 2000,
    points: 2300,
    bonus: 15,
    description: "+15% bonus (Recommended)",
    popular: true,
  },
];

const giftBoxes = [
  {
    id: "starter-gift",
    name: "Learning Starter",
    points: 500,
    price: 500,
    icon: Gift,
    color: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
  },
  {
    id: "skill-gift",
    name: "Skill Booster",
    points: 1000,
    price: 1000,
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: "pro-gift",
    name: "Pro Career Box",
    points: 2500,
    price: 2500,
    icon: Award,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
];

export default function Wallet() {
  const { user } = useAuth();
  const { balance, totalEarned, totalSpent, isLoading: creditsLoading } = useCredits();
  const { toast } = useToast();
  const [voucherCode, setVoucherCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "buy" | "voucher" | "gift">("history");

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<CreditTransaction[]>({
    queryKey: ["/api/user/credits/transactions"],
    enabled: !!user,
  });

  const handleRedeemVoucher = async () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Enter voucher code",
        description: "Please enter a valid voucher code to redeem.",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await fetch("/api/user/credits/redeem-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: voucherCode.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Voucher Redeemed!",
          description: `${data.points} points have been added to your wallet.`,
        });
        setVoucherCode("");
      } else {
        toast({
          title: "Invalid Voucher",
          description: data.error || "This voucher code is invalid or has expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to redeem voucher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const getTransactionIcon = (type: string, reason: string) => {
    if (reason === "WELCOME_BONUS") return <Gift className="w-4 h-4 text-green-500" />;
    if (reason === "COURSE_ENROLLMENT") return <BookOpen className="w-4 h-4 text-blue-500" />;
    if (reason === "VOUCHER") return <Ticket className="w-4 h-4 text-purple-500" />;
    if (reason === "GIFT") return <Package className="w-4 h-4 text-pink-500" />;
    if (type === "CREDIT" || type === "BONUS") return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  };

  const getTransactionDescription = (reason: string) => {
    switch (reason) {
      case "WELCOME_BONUS": return "Welcome Bonus";
      case "COURSE_ENROLLMENT": return "Course Enrollment";
      case "VOUCHER": return "Voucher Redemption";
      case "GIFT": return "Gift Received";
      case "PURCHASE": return "Credit Purchase";
      case "REFERRAL": return "Referral Bonus";
      default: return reason;
    }
  };

  if (creditsLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Hero Card - Wallet Summary */}
          <motion.div variants={slideUp}>
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="pt-8 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Coins className="w-10 h-10 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                      <h1 
                        className="text-4xl sm:text-5xl font-bold"
                        style={{ fontFamily: "var(--font-display)" }}
                        data-testid="text-wallet-balance"
                      >
                        {balance.toLocaleString()}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">Learning Points</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="lg" 
                      onClick={() => setActiveTab("buy")}
                      data-testid="button-get-more-points"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Get More Points
                    </Button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Earned</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        +{totalEarned.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <BookOpen className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        -{totalSpent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={staggerItem}>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeTab === "history" ? "default" : "outline"}
                onClick={() => setActiveTab("history")}
                data-testid="button-tab-history"
              >
                <Clock className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button 
                variant={activeTab === "buy" ? "default" : "outline"}
                onClick={() => setActiveTab("buy")}
                data-testid="button-tab-buy"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>
              <Button 
                variant={activeTab === "voucher" ? "default" : "outline"}
                onClick={() => setActiveTab("voucher")}
                data-testid="button-tab-voucher"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Redeem Voucher
              </Button>
              <Button 
                variant={activeTab === "gift" ? "default" : "outline"}
                onClick={() => setActiveTab("gift")}
                data-testid="button-tab-gift"
              >
                <Gift className="w-4 h-4 mr-2" />
                Gift Credits
              </Button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div variants={staggerItem}>
            {activeTab === "history" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Transaction History
                  </CardTitle>
                  <CardDescription>
                    Track all your point earnings and spending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                        <WalletIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No transactions yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your earning and spending history will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div 
                          key={tx.id}
                          className="flex items-center justify-between gap-4 p-3 rounded-lg border hover-elevate"
                          data-testid={`transaction-${tx.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getTransactionIcon(tx.type, tx.reason)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {getTransactionDescription(tx.reason)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              tx.type === "DEBIT" 
                                ? "text-red-600 dark:text-red-400" 
                                : "text-green-600 dark:text-green-400"
                            }`}>
                              {tx.type === "DEBIT" ? "-" : "+"}{Math.abs(tx.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Balance: {tx.balanceAfter}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "buy" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    Buy Learning Credits
                  </CardTitle>
                  <CardDescription>
                    Recharge your wallet to unlock premium courses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Credit Packs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {creditPacks.map((pack) => (
                      <Card 
                        key={pack.id}
                        className={`relative hover-elevate cursor-pointer transition-all ${
                          pack.popular ? "border-primary ring-2 ring-primary/20" : ""
                        }`}
                        data-testid={`pack-${pack.id}`}
                      >
                        {pack.popular && (
                          <Badge 
                            className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary"
                          >
                            Most Popular
                          </Badge>
                        )}
                        <CardContent className="pt-6 text-center">
                          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 w-fit mx-auto mb-3">
                            <Coins className="w-8 h-8 text-amber-500" />
                          </div>
                          <h3 className="font-semibold text-lg">{pack.name}</h3>
                          <p className="text-2xl font-bold mt-2">
                            {pack.points.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">points</p>
                          {pack.bonus > 0 && (
                            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                              +{pack.bonus}% Bonus
                            </Badge>
                          )}
                          <Separator className="my-4" />
                          <p className="text-lg font-semibold">₹{pack.price}</p>
                          <p className="text-xs text-muted-foreground mb-4">{pack.description}</p>
                          <Button 
                            className="w-full"
                            variant={pack.popular ? "default" : "outline"}
                            data-testid={`button-buy-${pack.id}`}
                          >
                            Buy Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-700 dark:text-blue-300">Secure Payments</p>
                      <p className="text-blue-600 dark:text-blue-400">
                        All payments are processed securely. Points are credited instantly after successful payment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "voucher" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-muted-foreground" />
                    Redeem Voucher Code
                  </CardTitle>
                  <CardDescription>
                    Enter your voucher code to claim free points
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter voucher code (e.g., WELCOME500)"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className="uppercase"
                      data-testid="input-voucher-code"
                    />
                    <Button 
                      onClick={handleRedeemVoucher}
                      disabled={isRedeeming || !voucherCode.trim()}
                      data-testid="button-redeem-voucher"
                    >
                      {isRedeeming ? "Redeeming..." : "Redeem"}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">How vouchers work:</h4>
                    <div className="space-y-2">
                      {[
                        "Voucher codes can be obtained from promotions, events, or referrals",
                        "Each voucher can only be redeemed once per account",
                        "Points from vouchers are added instantly to your wallet",
                        "Some vouchers may have expiry dates",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "gift" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-muted-foreground" />
                    Gift Learning Credits
                  </CardTitle>
                  <CardDescription>
                    Send a gift box to help someone start their learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {giftBoxes.map((gift) => (
                      <Card 
                        key={gift.id}
                        className="hover-elevate cursor-pointer transition-all"
                        data-testid={`gift-${gift.id}`}
                      >
                        <CardContent className="pt-6 text-center">
                          <div className={`p-3 rounded-full ${gift.bgColor} w-fit mx-auto mb-3`}>
                            <gift.icon className={`w-8 h-8 ${gift.color}`} />
                          </div>
                          <h3 className="font-semibold">{gift.name}</h3>
                          <p className="text-2xl font-bold mt-2 flex items-center justify-center gap-1">
                            <Coins className="w-5 h-5 text-amber-500" />
                            {gift.points.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">points</p>
                          <Separator className="my-4" />
                          <p className="text-lg font-semibold">₹{gift.price}</p>
                          <Button 
                            className="w-full mt-4"
                            variant="outline"
                            data-testid={`button-send-${gift.id}`}
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Send Gift
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800">
                    <Gift className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-pink-700 dark:text-pink-300">Gift someone the joy of learning!</p>
                      <p className="text-pink-600 dark:text-pink-400">
                        The recipient will receive an email with instructions to claim their gift credits.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Earning Rules */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                  Points Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Gift, text: "500 points free on signup", color: "text-green-500" },
                    { icon: BookOpen, text: "Use points to enroll in courses", color: "text-blue-500" },
                    { icon: AlertCircle, text: "Points are non-transferable", color: "text-amber-500" },
                    { icon: ShieldCheck, text: "Points cannot be withdrawn", color: "text-red-500" },
                  ].map((rule, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <rule.icon className={`w-5 h-5 ${rule.color}`} />
                      <p className="text-sm">{rule.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={staggerItem}>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses">
                <Button variant="outline" data-testid="button-browse-courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
              <Link href="/shishya/certificates">
                <Button variant="outline" data-testid="button-view-certificates">
                  <Award className="w-4 h-4 mr-2" />
                  View Certificates
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
