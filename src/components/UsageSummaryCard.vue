<script setup lang="ts">
import { CalendarDays, Mail, RefreshCw } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  getPackageTitle,
  getQuotaRatio,
  getRemainingDays,
} from "@/features/codex-usage/format";
import type { PackageInfo, UsageMetrics } from "@/features/codex-usage/types";

defineProps<{
  packageInfo: PackageInfo["packages"][number] | null;
  dailyUsage: UsageMetrics | null;
  weeklyUsage: UsageMetrics | null;
  email?: string | null;
  loading?: boolean;
}>();

defineEmits<{
  refresh: [];
}>();
</script>

<template>
  <Card
    class="relative overflow-hidden border-white/50 bg-[radial-gradient(circle_at_top_right,rgba(0,193,106,0.2),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,255,250,0.78))] dark:bg-[radial-gradient(circle_at_top_right,rgba(0,193,106,0.16),transparent_32%),linear-gradient(180deg,rgba(9,31,22,0.92),rgba(7,24,18,0.88))]"
  >
    <div class="absolute right-5 top-5 z-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="glass-chip size-10 rounded-full"
              :disabled="loading"
              :aria-label="loading ? '更新中' : '立即刷新'"
              @click="$emit('refresh')"
            >
              <RefreshCw
                class="size-4"
                :class="{ 'animate-spin': loading }"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            立即刷新
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

    <CardHeader class="gap-5 pr-20">
      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div class="space-y-3">
          <Badge
            variant="outline"
            class="surface-primary-8 border-primary-20 w-fit text-primary"
            >订阅概览</Badge
          >
          <div class="space-y-2">
            <CardTitle class="text-3xl">{{
              getPackageTitle(packageInfo)
            }}</CardTitle>
            <CardDescription class="max-w-2xl">
              生效 {{ formatDate(packageInfo?.start_at) }} · 到期
              {{ formatDate(packageInfo?.expires_at) }} · 剩余
              {{ getRemainingDays(packageInfo?.expires_at) }}
            </CardDescription>
            <div
              class="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Mail class="size-4 shrink-0" />
              <span class="truncate">{{ email || "--" }}</span>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>

    <CardContent class="grid gap-4 lg:grid-cols-2">
      <div class="glass-surface rounded-[20px] p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <div class="text-lg font-semibold">今日配额</div>
            <div class="mt-1 text-sm text-muted-foreground">
              当天的费用与请求消耗
            </div>
          </div>
          <Badge>{{ formatPercent(dailyUsage?.used_percentage) }}</Badge>
        </div>
        <Progress :model-value="getQuotaRatio(dailyUsage)" />
        <div
          class="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground"
        >
          <span
            >{{ formatCurrency(dailyUsage?.total_cost) }} /
            {{ formatCurrency(dailyUsage?.total_quota) }}</span
          >
          <span class="font-medium text-foreground"
            >{{
              dailyUsage?.request_count?.toLocaleString("zh-CN") || 0
            }}
            次</span
          >
        </div>
      </div>

      <div class="glass-surface rounded-[20px] p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <div class="text-lg font-semibold">本周配额</div>
            <div class="mt-1 text-sm text-muted-foreground">
              按周观察订阅余额变化
            </div>
          </div>
          <Badge variant="secondary">
            <CalendarDays class="mr-1 size-3.5" />
            {{ formatPercent(weeklyUsage?.used_percentage) }}
          </Badge>
        </div>
        <Progress
          :model-value="getQuotaRatio(weeklyUsage)"
          indicator-class="gradient-progress-weekly"
        />
        <div
          class="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground"
        >
          <span
            >{{ formatCurrency(weeklyUsage?.total_cost) }} /
            {{ formatCurrency(weeklyUsage?.total_quota) }}</span
          >
          <span class="font-medium text-foreground"
            >{{ formatCurrency(weeklyUsage?.remaining_quota) }} 剩余</span
          >
        </div>
      </div>
    </CardContent>
  </Card>
</template>
