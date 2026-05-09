<template>
  <div>
    <Transition name="fade">
      <div v-if="adminLoginVisible" class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/40 backdrop-blur-[80px]">
        <div class="w-full max-w-md p-12 space-y-12 text-center animate-in fade-in zoom-in-95 duration-700">
          <div class="space-y-4">
            <h2 class="text-[10px] uppercase tracking-[0.6em] text-red-500 font-bold opacity-80">System.Authorize</h2>
            <h1 class="text-4xl font-light tracking-tighter text-white/90">Authentication Required</h1>
          </div>
          
          <div class="relative group">
            <input 
              ref="passwordInputRef"
              :value="adminPassword" 
              type="password" 
              autofocus
              class="w-full bg-transparent border-b border-white/10 py-6 text-4xl text-center font-light tracking-[0.4em] focus:outline-none focus:border-red-500/60 transition-all placeholder:text-white/5" 
              placeholder="••••"
              @input="$emit('update:adminPassword', $event.target.value)"
              @keyup.enter="$emit('login')"
            />
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-red-500 transition-all duration-700 group-focus-within:w-full shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
          </div>

          <div class="flex flex-col gap-4 pt-8">
            <button @click="$emit('login')" class="group relative py-4 px-8 overflow-hidden rounded-full border border-white/10 hover:border-red-500/40 transition-all duration-500">
              <span class="relative z-10 text-[10px] uppercase tracking-[0.4em] text-white/60 group-hover:text-white">Initialize Root Access</span>
              <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
            <button @click="$emit('close-login')" class="text-[9px] uppercase tracking-[0.2em] text-white/20 hover:text-white/60 transition-colors">Abort Connection</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="page">
      <div v-if="isAdmin" class="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[40] w-[95%] sm:w-auto">
        <div class="glass-card !p-3 sm:!p-4 flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-6 shadow-2xl shadow-blue-500/20">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldAlert :size="14" />
            <span class="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Root Auth</span>
          </div>
          
          <div class="h-4 w-px bg-white/10 hidden sm:block"></div>
          
          <div class="flex items-center gap-1 sm:gap-2">
            <button @click="$emit('open-blacklist')" class="p-2 sm:px-4 sm:py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all flex items-center gap-2">
              <Users :size="16" />
              <span class="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">Blacklist</span>
            </button>
            <button @click="$emit('open-password')" class="p-2 sm:px-4 sm:py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all flex items-center gap-2">
              <Lock :size="16" />
              <span class="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">Security</span>
            </button>
            <button @click="$emit('exit-admin')" class="p-2 sm:px-4 sm:py-2 rounded-xl bg-red-500/5 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-2 border border-red-500/10">
              <LogOut :size="16" />
              <span class="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <UiModal v-model="blacklistVisible" max-width="37.5rem">
      <div class="py-6 space-y-8">
        <div class="space-y-1">
          <h2 class="text-sm font-bold tracking-widest uppercase text-red-400">Restricted Access</h2>
          <p class="text-[10px] text-slate-500 uppercase">Managing banned entities in the void</p>
        </div>

        <div class="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          <div v-for="item in blacklist" :key="item.ip" class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-xs font-mono">IP</div>
              <div>
                <p class="text-sm font-mono text-slate-200">{{ item.ip }}</p>
                <p class="text-[9px] text-slate-500 uppercase">{{ item.reason || 'No reason provided' }}</p>
              </div>
            </div>
            <button @click="$emit('unban', item.ip)" class="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all opacity-0 group-hover:opacity-100">Release</button>
          </div>
          <div v-if="blacklist.length === 0" class="py-12 text-center text-[10px] text-slate-600 uppercase tracking-widest">The void is empty</div>
        </div>

        <button @click="$emit('update:showBlacklistModal', false)" class="w-full py-4 rounded-xl text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Close Registry</button>
      </div>
    </UiModal>

    <UiModal v-model="passwordVisible" max-width="25rem">
      <div class="py-6 space-y-8 text-center">
        <div class="space-y-1">
          <h2 class="text-sm font-bold tracking-widest uppercase text-blue-400">Security.Update</h2>
          <p class="text-[10px] text-slate-500 uppercase">Updating root credentials</p>
        </div>

        <div class="space-y-4">
          <input :value="pwdForm.oldPassword" @input="$emit('update:pwdForm', { ...pwdForm, oldPassword: $event.target.value })" type="password" class="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/40 transition-all text-center tracking-widest" placeholder="CURRENT PASSWORD" />
          <input :value="pwdForm.newPassword" @input="$emit('update:pwdForm', { ...pwdForm, newPassword: $event.target.value })" type="password" class="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/40 transition-all text-center tracking-widest" placeholder="NEW PASSWORD" />
        </div>

        <div class="flex gap-4">
          <button @click="$emit('update:showPasswordModal', false)" class="flex-1 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white">Cancel</button>
          <button @click="$emit('change-password')" class="flex-[2] py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Update Key</button>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup>
import { computed, nextTick, watch } from 'vue'
import UiModal from '@/components/ui/Modal.vue'
import { LogOut, Lock, ShieldAlert, Users } from 'lucide-vue-next'

const props = defineProps({
  adminLoginVisible: { type: Boolean, default: false },
  adminPassword: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  showBlacklistModal: { type: Boolean, default: false },
  showPasswordModal: { type: Boolean, default: false },
  blacklist: { type: Array, default: () => [] },
  pwdForm: { type: Object, required: true },
  passwordInputRef: { type: Object, default: null }
})

const emit = defineEmits([
  'update:adminPassword',
  'update:showBlacklistModal',
  'update:showPasswordModal',
  'update:pwdForm',
  'login',
  'close-login',
  'open-blacklist',
  'open-password',
  'exit-admin',
  'unban',
  'change-password'
])

const blacklistVisible = computed({
  get: () => props.showBlacklistModal,
  set: (value) => emit('update:showBlacklistModal', value)
})

const passwordVisible = computed({
  get: () => props.showPasswordModal,
  set: (value) => emit('update:showPasswordModal', value)
})

watch(() => props.adminLoginVisible, async (visible) => {
  if (!visible) return
  await nextTick()
  props.passwordInputRef?.value?.focus?.()
})
</script>
