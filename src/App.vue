<script setup lang="ts">
import { AlertCircle } from "lucide-vue-next";
import AccountConfigPanel from "@/components/AccountConfigPanel.vue";
import UsageDashboard from "@/components/UsageDashboard.vue";
import { Alert } from "@/components/ui/alert";
import { useCodexUsage } from "@/features/codex-usage/useCodexUsage";

const {
  dailyUsage,
  form,
  hasProfile,
  packageInfo,
  pollInterval,
  pollOptions,
  refreshUsage,
  resetProfile,
  saveProfile,
  setPollInterval,
  state,
  weeklyUsage,
} = useCodexUsage();

async function submitProfile() {
  await saveProfile();
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        class="absolute -left-16 top-0 h-72 w-72 rounded-full glow-primary blur-3xl"
      />
      <div
        class="absolute right-0 top-20 h-80 w-80 rounded-full glow-chart-2 blur-3xl"
      />
      <div
        class="absolute bottom-0 left-1/3 h-72 w-72 rounded-full glow-chart-3 blur-3xl"
      />
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.5),transparent_35%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]"
      />
    </div>

    <main
      class="relative mx-auto flex min-h-screen w-full max-w-[1480px] flex-col"
    >
      <div class="grid gap-10 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div
          v-if="!hasProfile"
          class="grid gap-8"
        >
          <Alert
            v-if="state.error"
            variant="destructive"
          >
            <template #title>
              <div class="flex items-center gap-2">
                <AlertCircle class="size-4" />
                保存失败
              </div>
            </template>
            {{ state.error }}
          </Alert>

          <AccountConfigPanel
            :form="form"
            :has-profile="false"
            :busy="state.loading"
            :saving-secret="state.persistingSecret"
            :poll-interval="pollInterval"
            :poll-options="pollOptions"
            @submit="submitProfile"
            @reset="resetProfile"
            @update-poll-interval="setPollInterval"
          />
        </div>

        <UsageDashboard
          v-else
          :daily-usage="dailyUsage"
          :form="form"
          :package-info="packageInfo"
          :poll-interval="pollInterval"
          :poll-options="pollOptions"
          :state="state"
          :weekly-usage="weeklyUsage"
          @refresh="refreshUsage"
          @reset="resetProfile"
          @submit="submitProfile"
          @update-poll-interval="setPollInterval"
        />
      </div>
    </main>
  </div>
</template>
