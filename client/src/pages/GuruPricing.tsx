import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Coins,
  DollarSign,
  CreditCard,
  Pencil,
  Check,
  X,
  Cloud,
  BookOpen,
  Gift,
  IndianRupee,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Eye,
  EyeOff,
  Zap,
  Crown,
  Building2,
  type LucideIcon,
} from "lucide-react";

const ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "Gift", label: "Gift", icon: Gift },
  { value: "Zap", label: "Zap", icon: Zap },
  { value: "Crown", label: "Crown", icon: Crown },
  { value: "Building2", label: "Building", icon: Building2 },
  { value: "Star", label: "Star", icon: Star },
  { value: "Coins", label: "Coins", icon: Coins },
  { value: "CreditCard", label: "Credit Card", icon: CreditCard },
  { value: "DollarSign", label: "Dollar", icon: DollarSign },
];

const ICON_MAP: Record<string, LucideIcon> = {
  Gift, Zap, Crown, Building2, Star, Coins, CreditCard, DollarSign,
};

interface PricingPlan {
  id: number;
  name: string;
  subtitle: string | null;
  price: string;
  period: string | null;
  coins: string | null;
  coinsLabel: string | null;
  iconName: string;
  features: string[];
  notIncluded: string[];
  cta: string;
  href: string;
  buttonVariant: string;
  popular: boolean;
  orderIndex: number;
  isActive: boolean;
}

const emptyPlan: Omit<PricingPlan, "id"> = {
  name: "",
  subtitle: "",
  price: "",
  period: "",
  coins: "",
  coinsLabel: "",
  iconName: "Gift",
  features: [""],
  notIncluded: [],
  cta: "Get Started",
  href: "/signup",
  buttonVariant: "outline",
  popular: false,
  orderIndex: 0,
  isActive: true,
};

interface Course {
  id: number;
  title: string;
  description: string | null;
  shortDescription: string | null;
  level: string;
  duration: string | null;
  skills: string | null;
  status: string;
  isActive: boolean;
  isFree: boolean;
  creditCost: number;
  price: number;
  testRequired: boolean;
  projectRequired: boolean;
  createdAt: string;
  zohoId: string | null;
  category: string | null;
}

function PricingPlansManager() {
  const { toast } = useToast();
  const [editPlan, setEditPlan] = useState<PricingPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState<Omit<PricingPlan, "id">>(emptyPlan);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: plans, isLoading } = useQuery<PricingPlan[]>({
    queryKey: ["/api/guru/pricing-plans"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<PricingPlan, "id">) => {
      const res = await apiRequest("POST", "/api/guru/pricing-plans", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/pricing-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-plans"] });
      setIsCreating(false);
      setNewPlan(emptyPlan);
      toast({ title: "Plan created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create plan", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PricingPlan> }) => {
      const res = await apiRequest("PUT", `/api/guru/pricing-plans/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/pricing-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-plans"] });
      setEditPlan(null);
      toast({ title: "Plan updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update plan", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/guru/pricing-plans/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/pricing-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-plans"] });
      setDeleteId(null);
      toast({ title: "Plan deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete plan", description: error.message, variant: "destructive" });
    },
  });

  const moveOrder = (plan: PricingPlan, direction: "up" | "down") => {
    if (!plans) return;
    const sorted = [...plans].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex(p => p.id === plan.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const otherPlan = sorted[swapIdx];
    updateMutation.mutate({ id: plan.id, data: { orderIndex: otherPlan.orderIndex } });
    updateMutation.mutate({ id: otherPlan.id, data: { orderIndex: plan.orderIndex } });
  };

  const addFeature = (setter: (fn: (prev: any) => any) => void, key: "features" | "notIncluded") => {
    setter((prev: any) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const updateFeature = (setter: (fn: (prev: any) => any) => void, key: "features" | "notIncluded", index: number, value: string) => {
    setter((prev: any) => {
      const arr = [...prev[key]];
      arr[index] = value;
      return { ...prev, [key]: arr };
    });
  };

  const removeFeature = (setter: (fn: (prev: any) => any) => void, key: "features" | "notIncluded", index: number) => {
    setter((prev: any) => ({
      ...prev,
      [key]: prev[key].filter((_: string, i: number) => i !== index),
    }));
  };

  const renderPlanForm = (
    plan: Omit<PricingPlan, "id"> | PricingPlan,
    setter: (fn: (prev: any) => any) => void,
    onSave: () => void,
    onCancel: () => void,
    isPending: boolean,
    title: string
  ) => (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-plan-dialog-title">{title}</DialogTitle>
          <DialogDescription>Configure all properties for this pricing plan card</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Plan Name</Label>
            <Input
              value={plan.name}
              onChange={e => setter((p: any) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Pro"
              data-testid="input-plan-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={plan.subtitle || ""}
              onChange={e => setter((p: any) => ({ ...p, subtitle: e.target.value }))}
              placeholder="e.g. Most Popular"
              data-testid="input-plan-subtitle"
            />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              value={plan.price}
              onChange={e => setter((p: any) => ({ ...p, price: e.target.value }))}
              placeholder="e.g. ₹499"
              data-testid="input-plan-price"
            />
          </div>
          <div className="space-y-2">
            <Label>Period</Label>
            <Input
              value={plan.period || ""}
              onChange={e => setter((p: any) => ({ ...p, period: e.target.value }))}
              placeholder="e.g. / month"
              data-testid="input-plan-period"
            />
          </div>
          <div className="space-y-2">
            <Label>Coins</Label>
            <Input
              value={plan.coins || ""}
              onChange={e => setter((p: any) => ({ ...p, coins: e.target.value }))}
              placeholder="e.g. 6,000"
              data-testid="input-plan-coins"
            />
          </div>
          <div className="space-y-2">
            <Label>Coins Label</Label>
            <Input
              value={plan.coinsLabel || ""}
              onChange={e => setter((p: any) => ({ ...p, coinsLabel: e.target.value }))}
              placeholder="e.g. per month"
              data-testid="input-plan-coins-label"
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={plan.iconName} onValueChange={v => setter((p: any) => ({ ...p, iconName: v }))}>
              <SelectTrigger data-testid="select-plan-icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map(opt => {
                  const IconComp = opt.icon;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <IconComp className="w-4 h-4" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Button Variant</Label>
            <Select value={plan.buttonVariant} onValueChange={v => setter((p: any) => ({ ...p, buttonVariant: v }))}>
              <SelectTrigger data-testid="select-plan-variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Filled)</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>CTA Text</Label>
            <Input
              value={plan.cta}
              onChange={e => setter((p: any) => ({ ...p, cta: e.target.value }))}
              placeholder="e.g. Go Pro"
              data-testid="input-plan-cta"
            />
          </div>
          <div className="space-y-2">
            <Label>CTA Link</Label>
            <Input
              value={plan.href}
              onChange={e => setter((p: any) => ({ ...p, href: e.target.value }))}
              placeholder="e.g. /signup"
              data-testid="input-plan-href"
            />
          </div>
          <div className="flex items-center gap-3 col-span-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={plan.popular}
                onCheckedChange={v => setter((p: any) => ({ ...p, popular: v }))}
                data-testid="switch-plan-popular"
              />
              <Label>Mark as Popular</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={plan.isActive}
                onCheckedChange={v => setter((p: any) => ({ ...p, isActive: v }))}
                data-testid="switch-plan-active"
              />
              <Label>Active</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-base font-semibold">Features (included)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFeature(setter, "features")}
              data-testid="button-add-feature"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          {plan.features.map((f: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500 shrink-0" />
              <Input
                value={f}
                onChange={e => updateFeature(setter, "features", i, e.target.value)}
                placeholder="Feature description"
                data-testid={`input-feature-${i}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFeature(setter, "features", i)}
                data-testid={`button-remove-feature-${i}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-base font-semibold">Not Included</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFeature(setter, "notIncluded")}
              data-testid="button-add-not-included"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          {plan.notIncluded.map((f: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <X className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={f}
                onChange={e => updateFeature(setter, "notIncluded", i, e.target.value)}
                placeholder="Not included item"
                data-testid={`input-not-included-${i}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFeature(setter, "notIncluded", i)}
                data-testid={`button-remove-not-included-${i}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} data-testid="button-cancel-plan">
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isPending || !plan.name || !plan.price}
            data-testid="button-save-plan"
          >
            {isPending ? "Saving..." : "Save Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-5 w-24 mx-auto" />
              <Skeleton className="h-8 w-20 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const sortedPlans = plans ? [...plans].sort((a, b) => a.orderIndex - b.orderIndex) : [];
  const canCreate = sortedPlans.length < 5;
  const canDelete = sortedPlans.length > 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-muted-foreground">
            Manage the subscription plan cards shown on the public pricing page. Minimum 1, maximum 5 plans.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {sortedPlans.length} of 5 plans configured ({sortedPlans.filter(p => p.isActive).length} active)
          </p>
        </div>
        <Button
          onClick={() => {
            setNewPlan({ ...emptyPlan, orderIndex: sortedPlans.length });
            setIsCreating(true);
          }}
          disabled={!canCreate}
          data-testid="button-add-plan"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedPlans.map((plan, idx) => {
          const IconComp = ICON_MAP[plan.iconName] || Gift;
          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.popular ? "border-primary ring-2 ring-primary/20" : ""
              } ${!plan.isActive ? "opacity-60" : ""}`}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-primary text-primary-foreground no-default-hover-elevate no-default-active-elevate">
                    <Star className="w-3 h-3" />
                    Popular
                  </Badge>
                </div>
              )}
              {!plan.isActive && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="gap-1 no-default-hover-elevate no-default-active-elevate">
                    <EyeOff className="w-3 h-3" />
                    Hidden
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  plan.popular ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.subtitle}</CardDescription>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                {plan.coins && (
                  <Badge variant="outline" className="mt-1 gap-1 no-default-hover-elevate no-default-active-elevate">
                    <Coins className="w-3 h-3 text-amber-500" />
                    {plan.coins} {plan.coinsLabel}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <ul className="space-y-1.5 text-sm">
                  {plan.features.slice(0, 4).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{f}</span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-xs text-muted-foreground pl-5">
                      +{plan.features.length - 4} more
                    </li>
                  )}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-1 w-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveOrder(plan, "up")}
                    disabled={idx === 0}
                    data-testid={`button-move-up-${plan.id}`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveOrder(plan, "down")}
                    disabled={idx === sortedPlans.length - 1}
                    data-testid={`button-move-down-${plan.id}`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditPlan({ ...plan })}
                    data-testid={`button-edit-plan-${plan.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(plan.id)}
                    disabled={!canDelete}
                    data-testid={`button-delete-plan-${plan.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {isCreating && renderPlanForm(
        newPlan,
        setNewPlan,
        () => {
          const cleanPlan = { ...newPlan, features: newPlan.features.filter(f => f.trim()), notIncluded: newPlan.notIncluded.filter(f => f.trim()) };
          createMutation.mutate(cleanPlan);
        },
        () => { setIsCreating(false); setNewPlan(emptyPlan); },
        createMutation.isPending,
        "Create New Plan"
      )}

      {editPlan && renderPlanForm(
        editPlan,
        setEditPlan as any,
        () => {
          const { id, ...data } = editPlan;
          const cleanData = { ...data, features: data.features.filter(f => f.trim()), notIncluded: data.notIncluded.filter(f => f.trim()) };
          updateMutation.mutate({ id, data: cleanData });
        },
        () => setEditPlan(null),
        updateMutation.isPending,
        `Edit Plan: ${editPlan.name}`
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-plan-title">Delete Pricing Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this plan? This will remove it from the public pricing page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-plan">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete-plan"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function GuruPricing() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCreditCost, setEditCreditCost] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCreditAmount, setBulkCreditAmount] = useState("");
  const [setAllFreeOpen, setSetAllFreeOpen] = useState(false);

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/guru/courses"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Course> }) => {
      const res = await apiRequest("PUT", `/api/guru/courses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      setEditingId(null);
      toast({ title: "Pricing updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update pricing", description: error.message, variant: "destructive" });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (creditCost: number) => {
      const promises = (courses || []).map((course) =>
        apiRequest("PUT", `/api/guru/courses/${course.id}`, { creditCost })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      setBulkOpen(false);
      setBulkCreditAmount("");
      toast({ title: "All courses updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to bulk update", description: error.message, variant: "destructive" });
    },
  });

  const setAllFreeMutation = useMutation({
    mutationFn: async () => {
      const promises = (courses || []).map((course) =>
        apiRequest("PUT", `/api/guru/courses/${course.id}`, { isFree: true, creditCost: 0 })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      setSetAllFreeOpen(false);
      toast({ title: "All courses set to free" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to set all free", description: error.message, variant: "destructive" });
    },
  });

  const startEditing = (course: Course) => {
    setEditingId(course.id);
    setEditCreditCost(String(course.creditCost));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditCreditCost("");
  };

  const saveCredits = (courseId: number) => {
    const cost = parseInt(editCreditCost) || 0;
    updateMutation.mutate({ id: courseId, data: { creditCost: cost } });
  };

  const toggleFree = (course: Course) => {
    updateMutation.mutate({
      id: course.id,
      data: { isFree: !course.isFree, creditCost: !course.isFree ? 0 : course.creditCost },
    });
  };

  const totalCourses = courses?.length ?? 0;
  const freeCourses = courses?.filter((c) => c.isFree).length ?? 0;
  const avgCreditCost =
    totalCourses > 0
      ? Math.round((courses?.reduce((sum, c) => sum + c.creditCost, 0) ?? 0) / totalCourses)
      : 0;
  const totalRevenue = courses?.reduce((sum, c) => sum + c.creditCost, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-pricing-title">
            Pricing & Credits
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-pricing-subtitle">
            Manage course pricing, credit governance, and subscription plans
          </p>
        </div>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList data-testid="tabs-pricing">
          <TabsTrigger value="plans" data-testid="tab-subscription-plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="courses" data-testid="tab-course-pricing">Course Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <PricingPlansManager />
        </TabsContent>

        <TabsContent value="courses" className="mt-6 space-y-6">
      <div className="flex items-center justify-end gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setSetAllFreeOpen(true)}
            data-testid="button-set-all-free"
          >
            <Gift className="w-4 h-4 mr-2" />
            Set All Free
          </Button>
          <Button
            onClick={() => setBulkOpen(true)}
            data-testid="button-bulk-update"
          >
            <Coins className="w-4 h-4 mr-2" />
            Bulk Update Credits
          </Button>
        </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
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
            <Card data-testid="stat-total-courses">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-total-courses">
                  {totalCourses}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-free-courses">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Free Courses
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <Gift className="w-4 h-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-free-courses">
                  {freeCourses}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-avg-credit-cost">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Credit Cost
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <CreditCard className="w-4 h-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-avg-credit-cost">
                  {avgCreditCost}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-total-revenue">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-total-revenue">
                  {totalRevenue.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : courses && courses.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credit Cost</TableHead>
                  <TableHead>Free / Paid</TableHead>
                  <TableHead>Price (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} data-testid={`row-pricing-${course.id}`}>
                    <TableCell>
                      <Link href={`/guru/courses/${course.id}`}>
                        <span className="font-medium hover:underline cursor-pointer" data-testid={`link-pricing-course-${course.id}`}>
                          {course.title}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell data-testid={`text-pricing-source-${course.id}`}>
                      {course.zohoId ? (
                        <Badge variant="outline" className="gap-1 no-default-hover-elevate no-default-active-elevate">
                          <Cloud className="w-3 h-3" />
                          TrainerCentral
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={course.status === "published" ? "default" : "secondary"}
                        className={
                          course.status === "published"
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                            : "no-default-hover-elevate no-default-active-elevate"
                        }
                        data-testid={`badge-pricing-status-${course.id}`}
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === course.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editCreditCost}
                            onChange={(e) => setEditCreditCost(e.target.value)}
                            className="w-20"
                            data-testid={`input-edit-credit-${course.id}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => saveCredits(course.id)}
                            disabled={updateMutation.isPending}
                            data-testid={`button-save-credit-${course.id}`}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                            data-testid={`button-cancel-credit-${course.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span data-testid={`text-credit-cost-${course.id}`}>
                            {course.creditCost}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(course)}
                            data-testid={`button-edit-credit-${course.id}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={course.isFree}
                          onCheckedChange={() => toggleFree(course)}
                          data-testid={`switch-free-${course.id}`}
                        />
                        <span className="text-sm text-muted-foreground" data-testid={`text-free-label-${course.id}`}>
                          {course.isFree ? "Free" : "Paid"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-price-${course.id}`}>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-muted-foreground" />
                        {course.price.toLocaleString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="empty-pricing">
          <CardContent className="p-8 text-center">
            <Coins className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No courses found. Create courses first to manage pricing.</p>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle data-testid="text-bulk-dialog-title">Bulk Update Credits</DialogTitle>
            <DialogDescription>Set the same credit cost for all courses</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-credit-amount">Credit Cost</Label>
              <Input
                id="bulk-credit-amount"
                type="number"
                min="0"
                value={bulkCreditAmount}
                onChange={(e) => setBulkCreditAmount(e.target.value)}
                placeholder="Enter credit amount"
                data-testid="input-bulk-credit-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)} data-testid="button-cancel-bulk">
              Cancel
            </Button>
            <Button
              onClick={() => bulkUpdateMutation.mutate(parseInt(bulkCreditAmount) || 0)}
              disabled={bulkCreditAmount === "" || bulkUpdateMutation.isPending}
              data-testid="button-submit-bulk"
            >
              {bulkUpdateMutation.isPending ? "Updating..." : "Update All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={setAllFreeOpen} onOpenChange={setSetAllFreeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-set-all-free-dialog-title">Set All Courses Free</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set all courses to free? This will set the credit cost to 0 and mark all courses as free. This action affects {totalCourses} course{totalCourses !== 1 ? "s" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-set-all-free">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setAllFreeMutation.mutate()}
              data-testid="button-confirm-set-all-free"
            >
              {setAllFreeMutation.isPending ? "Processing..." : "Set All Free"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
