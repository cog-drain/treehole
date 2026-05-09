<template>
  <UiModal
    v-model="visible"
    max-width="34rem"
    @closed="$emit('update:modelValue', false)"
  >
    <!-- 动态类名切换：is-zen-dark (图1原版样式) | is-zen-light (清爽浅色样式) -->
    <div 
      class="relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-700 border"
      :class="[
        isDark 
          ? 'is-zen-dark bg-slate-950/85 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.6)]' 
          : 'is-zen-light bg-white/70 border-black/5 shadow-2xl backdrop-blur-3xl'
      ]"
    >
      <!-- 动态环境背景 (Sea Aurora) - 随主题调整透明度 -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          class="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[80px] animate-pulse"
          :class="isDark ? 'bg-cyan-500/20' : 'bg-cyan-400/10'"
        ></div>
        <div 
          class="absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-[80px] animate-pulse"
          :class="isDark ? 'bg-blue-500/20' : 'bg-blue-400/10'"
          style="animation-delay: -2s"
        ></div>
      </div>

      <!-- 头部装饰 -->
      <div class="relative z-10 text-center mb-8">
        <p
          class="text-[9px] tracking-[0.8em] uppercase block mb-1 drop-shadow-sm"
          :class="isDark ? '!text-white/30' : '!text-slate-400'"
        >Etheral Sea</p>
        <h3 
          class="text-xl font-light tracking-[0.2em] drop-shadow-md"
          :class="isDark ? 'text-white' : 'text-slate-800'"
        >
          {{ stateTitle }}
        </h3>
      </div>

      <!-- 1. 初始选择 (Initial Choice) -->
      <div v-if="state === 'init'" class="relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div class="grid grid-cols-2 gap-6 mb-6">
          <!-- 扔一个 -->
          <div 
            class="group cursor-pointer p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 active:scale-95 text-center relative overflow-hidden"
            :class="isDark ? 'bg-white/5 backdrop-blur-md border border-white/10' : 'bg-white/10 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:bg-white/20'"
            @click="state = 'throwing'"
          >
            <div class="w-20 h-20 mx-auto rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-5xl mb-6 group-hover:rotate-12 transition-transform duration-500">✉️</div>
            <div class="text-lg font-bold mb-1 tracking-widest text-slate-800 dark:text-white">扔一个</div>
            <div class="text-xs opacity-30 uppercase tracking-[0.2em] font-medium dark:text-white/40">Throw One</div>
          </div>

          <!-- 捞一个 -->
          <div 
            class="group cursor-pointer p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 active:scale-95 text-center relative overflow-hidden"
            :class="isDark ? 'bg-white/5 backdrop-blur-md border border-white/10' : 'bg-white/10 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:bg-white/20'"
            @click="handlePick"
          >
            <div class="w-20 h-20 mx-auto rounded-[2rem] bg-cyan-500/10 flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">🔍</div>
            <div class="text-lg font-bold mb-1 tracking-widest text-slate-800 dark:text-white">捞一个</div>
            <div class="text-xs opacity-30 uppercase tracking-[0.2em] font-medium dark:text-white/40">Pick One</div>
          </div>
        </div>

        <!-- 回响中心：降级为次级长条按钮 -->
        <div 
          class="group cursor-pointer mx-auto max-w-[280px] p-4 rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-white/30"
          :class="isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/10 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white/30'"
          @click="handleOpenInbox"
        >
          <div class="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg transition-transform group-hover:rotate-12">📥</div>
          <div class="flex flex-col items-start">
            <span class="text-sm font-bold tracking-widest text-slate-700 dark:text-white/80">回响中心</span>
            <span class="text-[9px] opacity-30 uppercase tracking-tighter dark:text-white/40">My Echoes</span>
          </div>
        </div>
        
        <div class="flex justify-center">
          <UiButton variant="link" size="sm" @click="visible = false" class="!text-[11px] opacity-40 uppercase tracking-[0.2em] hover:opacity-100">
            <ChevronLeft class="w-3 h-3 mr-1" /> 返回岸边
          </UiButton>
        </div>
      </div>

      <!-- 2. 写信状态 (Throwing) -->
      <div v-if="state === 'throwing'" class="relative z-10 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div 
          class="p-1 rounded-2xl border"
          :class="isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.03] border-black/5'"
        >
          <UiTextarea
            v-model="newContent"
            :rows="6"
            placeholder="这封信将随机出现在一个陌生人的海滩上..."
          />
        </div>
        <div class="flex gap-4">
          <UiButton
            variant="secondary"
            class="flex-1" 
            :class="isDark ? '!bg-white/5 !text-white/40 hover:!bg-white/10' : '!bg-black/[0.05] !text-slate-500 hover:!bg-black/10'"
            @click="state = 'init'"
          >取消</UiButton>
          <UiButton
            variant="success"
            size="lg"
            class="flex-1" 
            :disabled="!newContent.trim()"
            @click="handleThrow"
          >投向大海</UiButton>
        </div>
      </div>

      <!-- 3. 捞信中 (Picking) -->
      <div v-if="state === 'picking'" class="relative z-10 py-16 flex flex-col items-center gap-8 animate-in fade-in duration-700">
        <div class="relative">
          <Waves 
            class="w-20 h-20 animate-pulse scale-150" 
            :class="isDark ? 'text-cyan-400/30' : 'text-cyan-500/20'"
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <div 
              class="w-2 h-2 rounded-full animate-ping"
              :class="isDark ? 'bg-white' : 'bg-cyan-600'"
            ></div>
          </div>
        </div>
        <p
          class="text-xs tracking-[0.5em] animate-pulse"
          :class="isDark ? '!text-white/30' : '!text-slate-400'"
        >正在深海搜寻缘分...</p>
        <UiButton
          variant="link"
          size="sm"
          class="hover:!text-white/50" 
          :class="isDark ? '!text-white/20' : '!text-slate-400'"
          @click="state = 'init'"
        >放弃搜寻</UiButton>
      </div>

      <!-- 4. 捞到了 (Picked) / 回信中 (Reply) -->
      <div v-if="(state === 'picked' || state === 'reply') && pickedData" class="relative z-10 space-y-6 animate-in zoom-in-95 duration-500">
        <div 
          class="flex items-center justify-between p-4 rounded-2xl border"
          :class="isDark ? 'bg-white/5 border-white/5' : 'bg-black/[0.02] border-black/5'"
        >
          <div class="flex items-center gap-4">
            <div 
              class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              :class="isDark ? 'bg-cyan-500/20' : 'bg-white shadow-sm'"
            >✉️</div>
            <div>
              <p class="font-bold block" :class="isDark ? '!text-white/80' : '!text-slate-800'">来自 {{ pickedData.authorAlias }} 的漂流瓶</p>
              <p class="text-xs" :class="isDark ? '!text-white/30' : '!text-slate-400'">{{ formatTime(pickedData.createTime) }}</p>
            </div>
          </div>
        </div>

        <!-- 留言原文 -->
        <div 
          class="p-8 rounded-[2.5rem] border italic text-sm leading-loose tracking-wide min-h-[100px] flex items-center justify-center text-center transition-all duration-500"
          :class="[
            isDark ? 'bg-black/30 border-white/5 text-white/90' : 'bg-black/[0.04] border-black/5 text-slate-800 shadow-inner',
            state === 'reply' ? 'scale-95 opacity-60 blur-[1px]' : ''
          ]"
        >
          <span v-if="pickedData.content && String(pickedData.content).trim()">"{{ pickedData.content }}"</span>
          <span v-else class="opacity-40 not-italic">这个瓶子里空无一物，只留下了海浪的气息...</span>
        </div>

        <!-- 回复输入区 (动态展开) -->
        <Transition name="page">
          <div v-if="state === 'reply'" class="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div 
              class="glass-card !p-1 overflow-hidden"
              :class="isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'"
            >
              <UiTextarea
                v-model="replyContent"
                :rows="4"
                placeholder="给予这段缘分一份温热的回响..."
                autofocus
              />
            </div>
          </div>
        </Transition>

        <!-- 底部操作按钮 -->
        <div class="flex gap-4">
          <template v-if="state === 'picked'">
            <UiButton
              variant="secondary"
              size="icon"
              :class="isDark ? '!bg-white/5 !text-white/40 hover:!bg-white/10' : '!bg-black/[0.05] !text-slate-500 hover:!bg-black/10'"
              @click="handlePick"
              title="换一个"
            >
              <RefreshCw class="w-5 h-5" />
            </UiButton>
            <UiButton
              variant="secondary"
              class="flex-1"
              :class="isDark ? '!bg-white/5 !text-white/40 hover:!bg-white/10' : '!bg-black/[0.05] !text-slate-500 hover:!bg-black/10'"
              @click="handleReturn"
            >放回大海</UiButton>
            <UiButton variant="primary" class="flex-[2]" @click="state = 'reply'">回信给 Ta</UiButton>
          </template>
          <template v-else>
            <UiButton
              variant="secondary"
              class="flex-1"
              :class="isDark ? '!bg-white/5 !text-white/40 hover:!bg-white/10' : '!bg-black/[0.05] !text-slate-500 hover:!bg-black/10'"
              @click="state = 'picked'"
            >取消</UiButton>
            <UiButton
              variant="primary"
              class="flex-[2]"
              :disabled="!replyContent.trim()"
              @click="handleReply"
            >发送回响</UiButton>
          </template>
        </div>
      </div>

      <!-- 7. 我的瓶子/回响中心 (My Bottles) -->
      <div v-if="state === 'my-bottles'" class="relative z-10 space-y-4 animate-in slide-in-from-left-4 duration-500">
        <div class="flex items-center gap-2 mb-2">
          <UiButton variant="link" size="sm" @click="state = 'init'" :class="isDark ? '!text-white/40' : '!text-slate-500'">
            <ChevronLeft class="w-4 h-4 mr-1" /> 返回
          </UiButton>
        </div>
        
        <div class="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          <div v-if="myBottles.length === 0" class="py-12 text-center opacity-30 text-sm italic">
            海面上静悄悄的，还没有回响...
          </div>
          <div 
            v-for="bottle in myBottles" 
            :key="bottle.id"
            class="p-5 rounded-3xl border transition-all hover:border-cyan-500/30"
            :class="[
              isDark ? 'bg-white/5 border-white/5 shadow-xl shadow-black/20' : 'bg-white border-black/5 shadow-sm hover:shadow-md'
            ]"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg">✉️</div>
                <div class="flex flex-col">
                  <span class="text-[10px] uppercase tracking-widest opacity-40 leading-none">My Message</span>
                  <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400"># {{ bottle.id }}</span>
                </div>
              </div>
              <p class="opacity-20 text-[9px]">{{ formatTime(bottle.createTime) }}</p>
            </div>

            <div class="text-sm px-4 py-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 mb-4 italic opacity-80">
              “ {{ bottle.content }} ”
            </div>
            
            <div v-if="bottle.replyContent" class="relative mt-6 pt-6 border-t border-dashed border-black/10 dark:border-white/10">
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-lg shadow-cyan-500/20">REPLY RECEIVED</div>
              
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-sm">👤</div>
                <div class="flex flex-col">
                  <span class="text-[9px] uppercase tracking-tighter opacity-40 leading-none">From Echo</span>
                  <span class="text-xs font-bold text-cyan-600 dark:text-cyan-400">{{ bottle.replyAuthorAlias || '一位不愿透露姓名的路人' }}</span>
                </div>
              </div>

              <div class="text-sm px-4 py-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-900 dark:text-cyan-100 leading-relaxed font-medium">
                “ {{ bottle.replyContent }} ”
              </div>
              <div class="text-[9px] text-right mt-2 opacity-30 italic">{{ formatTime(bottle.replyTime) }}</div>
            </div>
            <div v-else class="text-center py-4 opacity-20 text-[10px] italic tracking-widest">漂流中，等待跨越海洋的回响...</div>
          </div>
        </div>
      </div>

      <!-- 6. 发送成功 (Sent) -->
      <div v-if="state === 'sent'" class="relative z-10 flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-50 duration-700">
        <div class="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center text-4xl animate-bounce">
          ✨
        </div>
        <div class="text-center space-y-2">
          <h3 class="text-lg font-bold tracking-widest text-cyan-400">回响已传达</h3>
          <p class="text-xs opacity-40">你的善意正顺着海流，温暖另一个灵魂...</p>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Mail, Search, Waves, ChevronLeft, RefreshCw } from 'lucide-vue-next'
import api from '@/api'
import { formatTime } from '@/utils/time.js'
import { useUiStore } from '@/stores/ui'
import UiButton from '@/components/ui/Button.vue'
import UiModal from '@/components/ui/Modal.vue'
import UiTextarea from '@/components/ui/Textarea.vue'

const props = defineProps({
  modelValue: Boolean,
  initialState: { type: String, default: 'init' },
  pickedData: Object,
  userId: String
})

const emit = defineEmits(['update:modelValue', 'onThrow', 'onPick', 'onReply', 'onReturn'])

const visible = ref(props.modelValue)
const state = ref(props.initialState)
const newContent = ref('')
const replyContent = ref('')
const myBottles = ref([])
const uiStore = useUiStore()
const isDark = computed(() => uiStore.isDark)

const stateTitle = computed(() => {
  switch (state.value) {
    case 'throw': return '写下心声'
    case 'picking': return '搜寻中'
    case 'picked': return '奇妙的缘分'
    case 'reply': return '给予回响'
    case 'my-bottles': return '回响中心'
    default: return '漂流瓶'
  }
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    state.value = props.initialState
  }
})

watch(() => props.pickedData, (val) => {
  if (val) state.value = 'picked'
})

const handleThrow = () => { emit('onThrow', newContent.value); newContent.value = ''; visible.value = false; }
const handlePick = () => { state.value = 'picking'; emit('onPick'); }
const handleReply = () => { 
  emit('onReply', replyContent.value); 
  replyContent.value = ''; 
  state.value = 'sent';
  setTimeout(() => {
    visible.value = false;
    setTimeout(() => { state.value = 'init' }, 500);
  }, 2000);
}
const handleReturn = () => { emit('onReturn'); state.value = 'init'; }

const handleOpenInbox = async () => {
  state.value = 'my-bottles'
  try {
    const res = await api.getMyBottles()
    myBottles.value = res.data || []
  } catch (e) {
    console.error('Fetch my bottles failed:', e)
  }
}
</script>

<style>
</style>
