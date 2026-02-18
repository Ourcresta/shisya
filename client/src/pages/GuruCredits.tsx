import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  Coins,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
} from "lucide-react";

interface WalletProfile {
  fullName: string | null;
  username: string | null;
}

interface CreditWallet {
  id: number;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  profile: WalletProfile | null;
  email: string;
}

interface CreditTransaction {
  id: number;
  userId: string;
  amount: number;
  type: string;
  reason: string | null;
  description: string | null;
  balanceAfter: number;
  createdAt: string;
}

export default function GuruCredits() {
  const { toast } = useToast();
  const [grantOpen, setGrantOpen] = useState(false);
  const [deductOpen, setDeductOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { data: wallets, isLoading: walletsLoading } = useQuery<CreditWallet[]>({
    queryKey: ["/api/guru/credits"],
  });

  const { data: transactions, isLoading: txnLoading } = useQuery<CreditTransaction[]>({
    queryKey: ["/api/guru/credits/transactions"],
  });

  const grantMutation = useMutation({
    mutationFn: async (data: { userId: string; amount: number; reason: string }) => {
      const res = await apiRequest("POST", "/api/guru/credits/grant", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/credits/transactions"] });
      setGrantOpen(false);
      resetForm();
      toast({ title: "Credits granted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to grant credits", description: error.message, variant: "destructive" });
    },
  });

  const deductMutation = useMutation({
    mutationFn: async (data: { userId: string; amount: number; reason: string }) => {
      const res = await apiRequest("POST", "/api/guru/credits/deduct", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/credits/transactions"] });
      setDeductOpen(false);
      resetForm();
      toast({ title: "Credits deducted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to deduct credits", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setSelectedUserId("");
    setAmount("");
    setReason("");
  };

  const openGrant = (userId?: string) => {
    resetForm();
    if (userId) setSelectedUserId(userId);
    setGrantOpen(true);
  };

  const openDeduct = (userId?: string) => {
    resetForm();
    if (userId) setSelectedUserId(userId);
    setDeductOpen(true);
  };

  const totalWallets = wallets?.length ?? 0;
  const totalInCirculation = wallets?.reduce((sum, w) => sum + w.balance, 0) ?? 0;
  const totalEarned = wallets?.reduce((sum, w) => sum + w.totalEarned, 0) ?? 0;
  const totalSpent = wallets?.reduce((sum, w) => sum + w.totalSpent, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-credits-title">
          Credit Governance
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-credits-subtitle">
          Manage student credit wallets and transactions
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {walletsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card data-testid="stat-total-wallets">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Wallets
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <Wallet className="w-4 h-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-total-wallets">
                  {totalWallets}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-credits-in-circulation">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Circulation
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <Coins className="w-4 h-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-credits-in-circulation">
                  {totalInCirculation.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-total-earned">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Earned
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-total-earned">
                  {totalEarned.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-total-spent">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Spent
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-total-spent">
                  {totalSpent.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="wallets" data-testid="tabs-credits">
        <TabsList data-testid="tabs-list-credits">
          <TabsTrigger value="wallets" data-testid="tab-wallets">Wallets</TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="mt-4">
          {walletsLoading ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : wallets && wallets.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Total Earned</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.map((wallet) => (
                      <TableRow key={wallet.id} data-testid={`row-wallet-${wallet.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium" data-testid={`text-wallet-name-${wallet.id}`}>
                              {wallet.profile?.fullName || "No name"}
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-wallet-email-${wallet.id}`}>
                              {wallet.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-wallet-balance-${wallet.id}`}>
                          <span className="font-semibold">{wallet.balance}</span>
                        </TableCell>
                        <TableCell data-testid={`text-wallet-earned-${wallet.id}`}>
                          {wallet.totalEarned}
                        </TableCell>
                        <TableCell data-testid={`text-wallet-spent-${wallet.id}`}>
                          {wallet.totalSpent}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openGrant(wallet.userId)}
                              data-testid={`button-grant-${wallet.id}`}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Grant
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeduct(wallet.userId)}
                              data-testid={`button-deduct-${wallet.id}`}
                            >
                              <Minus className="w-4 h-4 mr-1" />
                              Deduct
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="empty-wallets">
              <CardContent className="p-8 text-center">
                <Wallet className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No credit wallets found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          {txnLoading ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : transactions && transactions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Balance After</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id} data-testid={`row-txn-${txn.id}`}>
                        <TableCell data-testid={`text-txn-user-${txn.id}`}>
                          <span className="font-mono text-xs">
                            {txn.userId.length > 12
                              ? `${txn.userId.slice(0, 8)}...${txn.userId.slice(-4)}`
                              : txn.userId}
                          </span>
                        </TableCell>
                        <TableCell data-testid={`text-txn-amount-${txn.id}`}>
                          <span
                            className={
                              txn.amount > 0
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : "text-red-600 dark:text-red-400 font-semibold"
                            }
                          >
                            {txn.amount > 0 ? `+${txn.amount}` : txn.amount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize"
                            data-testid={`badge-txn-type-${txn.id}`}
                          >
                            {txn.type}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-txn-reason-${txn.id}`}>
                          {txn.reason || "-"}
                        </TableCell>
                        <TableCell data-testid={`text-txn-balance-after-${txn.id}`}>
                          {txn.balanceAfter}
                        </TableCell>
                        <TableCell data-testid={`text-txn-date-${txn.id}`}>
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="empty-transactions">
              <CardContent className="p-8 text-center">
                <Coins className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No transactions yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle data-testid="text-grant-dialog-title">Grant Credits</DialogTitle>
            <DialogDescription>Add credits to a student's wallet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger data-testid="select-grant-student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {wallets?.map((w) => (
                    <SelectItem key={w.userId} value={w.userId}>
                      {w.profile?.fullName || w.email} ({w.balance} credits)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grant-amount">Amount</Label>
              <Input
                id="grant-amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                data-testid="input-grant-amount"
              />
            </div>
            <div>
              <Label htmlFor="grant-reason">Reason</Label>
              <Input
                id="grant-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for granting credits"
                data-testid="input-grant-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantOpen(false)} data-testid="button-cancel-grant">
              Cancel
            </Button>
            <Button
              onClick={() =>
                grantMutation.mutate({
                  userId: selectedUserId,
                  amount: parseInt(amount) || 0,
                  reason,
                })
              }
              disabled={!selectedUserId || !amount || parseInt(amount) <= 0 || grantMutation.isPending}
              data-testid="button-submit-grant"
            >
              {grantMutation.isPending ? "Granting..." : "Grant Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deductOpen} onOpenChange={setDeductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle data-testid="text-deduct-dialog-title">Deduct Credits</DialogTitle>
            <DialogDescription>Remove credits from a student's wallet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger data-testid="select-deduct-student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {wallets?.map((w) => (
                    <SelectItem key={w.userId} value={w.userId}>
                      {w.profile?.fullName || w.email} ({w.balance} credits)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deduct-amount">Amount</Label>
              <Input
                id="deduct-amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                data-testid="input-deduct-amount"
              />
            </div>
            <div>
              <Label htmlFor="deduct-reason">Reason</Label>
              <Input
                id="deduct-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for deducting credits"
                data-testid="input-deduct-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeductOpen(false)} data-testid="button-cancel-deduct">
              Cancel
            </Button>
            <Button
              onClick={() =>
                deductMutation.mutate({
                  userId: selectedUserId,
                  amount: parseInt(amount) || 0,
                  reason,
                })
              }
              disabled={!selectedUserId || !amount || parseInt(amount) <= 0 || deductMutation.isPending}
              data-testid="button-submit-deduct"
            >
              {deductMutation.isPending ? "Deducting..." : "Deduct Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
