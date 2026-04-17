<script setup lang="ts">
import { computed, reactive } from "vue";
import { KeyRound, Save, Settings2, Trash2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AccountConfig, PollOption } from "@/features/codex-usage/types";

const props = defineProps<{
  form: AccountConfig;
  hasProfile: boolean;
  pollInterval: number;
  pollOptions: PollOption[];
  busy?: boolean;
  savingSecret?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  submit: [];
  updatePollInterval: [value: number];
  reset: [];
}>();

const panelTitle = computed(() =>
  props.hasProfile ? "查询配置" : "先配置你的查询账号",
);
const panelDescription = computed(() =>
  props.hasProfile
    ? "更新 Key 或刷新频率后立即生效。"
    : "填写 Key 后即可进入统计面板。",
);

const pollIntervalValue = computed({
  get: () => String(props.pollInterval),
  set: (value: string) => emit("updatePollInterval", Number(value)),
});

const touched = reactive({
  key: false,
});

const keyError = computed(() => {
  if (!touched.key) return "";
  return props.form.key.trim() ? "" : "请输入接口 Key";
});

const formValid = computed(() => props.form.key.trim().length > 0);

function touchField(field: keyof typeof touched) {
  touched[field] = true;
}

function handleSubmit() {
  touched.key = true;

  if (!formValid.value) return;

  emit("submit");
}
</script>

<template>
  <Card class="glass-panel border-white/50">
    <CardHeader :class="compact ? 'pb-4' : 'pb-5'">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-2">
          <div
            class="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Settings2 class="size-5" />
          </div>
          <CardTitle class="text-2xl">{{ panelTitle }}</CardTitle>
          <CardDescription class="max-w-xl">{{
            panelDescription
          }}</CardDescription>
        </div>
        <div
          v-if="!compact"
          class="glass-chip hidden rounded-full border border-border/70 px-4 py-2 text-xs text-muted-foreground md:flex md:items-center md:gap-2"
        >
          <KeyRound class="size-3.5" />
          本地加密保存
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <form
        class="grid gap-5"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <div class="grid gap-5">
          <div class="grid gap-2">
            <Label for="poll-interval">刷新频率</Label>
            <Select v-model="pollIntervalValue">
              <SelectTrigger id="poll-interval">
                <SelectValue placeholder="选择刷新频率" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in pollOptions"
                  :key="option.value"
                  :value="String(option.value)"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="account-key">Key</Label>
          <Input
            id="account-key"
            v-model="form.key"
            required
            type="password"
            placeholder="请输入接口 Key"
            :aria-invalid="Boolean(keyError)"
            :aria-describedby="keyError ? 'account-key-error' : undefined"
            :class="
              cn(
                keyError &&
                  'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10',
              )
            "
            @blur="touchField('key')"
          />
          <p
            v-if="keyError"
            id="account-key-error"
            class="text-sm leading-6 text-destructive"
          >
            {{ keyError }}
          </p>
        </div>

        <div class="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button
            class="sm:min-w-36"
            type="submit"
            :disabled="busy"
          >
            <Save class="size-4" />
            {{ busy ? "保存中..." : hasProfile ? "保存配置" : "开始查询" }}
          </Button>
          <Button
            v-if="hasProfile"
            class="sm:min-w-36"
            variant="outline"
            type="button"
            :disabled="busy"
            @click="emit('reset')"
          >
            <Trash2 class="size-4" />
            清空配置
          </Button>
        </div>

        <p
          v-if="savingSecret"
          class="text-sm leading-6 text-muted-foreground"
        >
          正在后台加密保存新 Key，你现在可以继续使用当前查询结果。
        </p>
      </form>
    </CardContent>
  </Card>
</template>
