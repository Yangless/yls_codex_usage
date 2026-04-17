<script setup lang="ts">
import { computed } from "vue";
import { AlertCircle } from "lucide-vue-next";
import AccountConfigPanel from "@/components/AccountConfigPanel.vue";
import MetricCard from "@/components/MetricCard.vue";
import UsageSummaryCard from "@/components/UsageSummaryCard.vue";
import { Alert } from "@/components/ui/alert";
import { formatCurrency, formatToken } from "@/features/codex-usage/format";
import type {
  AccountConfig,
  PackageInfo,
  PollOption,
  QueryState,
  UsageMetrics,
} from "@/features/codex-usage/types";

const props = defineProps<{
  form: AccountConfig;
  state: QueryState;
  packageInfo: PackageInfo["packages"][number] | null;
  dailyUsage: UsageMetrics | null;
  weeklyUsage: UsageMetrics | null;
  pollInterval: number;
  pollOptions: PollOption[];
}>();

const emit = defineEmits<{
  submit: [];
  refresh: [];
  reset: [];
  updatePollInterval: [value: number];
}>();

const statItems = computed(() => [
  {
    label: "账户余额",
    value: formatCurrency(props.state.data?.userAccountInfo.total_balance),
    tone: "warm" as const,
  },
  {
    label: "今日请求次数",
    value: props.dailyUsage?.request_count?.toLocaleString("zh-CN") || 0,
    tone: "warm" as const,
  },
  {
    label: "今日消耗额度",
    value: formatCurrency(props.dailyUsage?.total_cost),
    tone: "emerald" as const,
  },
  {
    label: "今日总 Token",
    value: formatToken(props.dailyUsage?.total_tokens),
    tone: "sky" as const,
  },
  { label: "输入 Token", value: formatToken(props.dailyUsage?.input_tokens) },
  {
    label: "缓存 Token",
    value: formatToken(props.dailyUsage?.input_tokens_cached),
  },
  { label: "输出 Token", value: formatToken(props.dailyUsage?.output_tokens) },
  {
    label: "推理 Token",
    value: formatToken(props.dailyUsage?.output_tokens_reasoning),
  },
]);
</script>

<template>
  <div class="grid gap-6">
    <div class="space-y-6">
      <UsageSummaryCard
        :package-info="packageInfo"
        :daily-usage="dailyUsage"
        :weekly-usage="weeklyUsage"
        :email="state.data?.user.email"
        :loading="state.loading"
        @refresh="emit('refresh')"
      />

      <section class="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          v-for="item in statItems"
          :key="item.label"
          :label="item.label"
          :tone="item.tone"
          :value="item.value"
        />
      </section>

      <Alert
        v-if="state.error"
        variant="destructive"
      >
        <template #title>
          <div class="flex items-center gap-2">
            <AlertCircle class="size-4" />
            请求失败
          </div>
        </template>
        {{ state.error }}
      </Alert>
    </div>

    <div class="space-y-6">
      <AccountConfigPanel
        compact
        :form="form"
        :has-profile="true"
        :busy="state.loading"
        :saving-secret="state.persistingSecret"
        :poll-interval="pollInterval"
        :poll-options="pollOptions"
        @submit="emit('submit')"
        @reset="emit('reset')"
        @update-poll-interval="emit('updatePollInterval', $event)"
      />
    </div>
  </div>
</template>
