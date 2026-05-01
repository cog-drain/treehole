<template>
  <div 
    class="min-h-screen"
    :class="{ 'zen-active': isZenMode, 'offline-mode': !isOnline }"
  >
    <!-- Background Ambient Glow (Theme Aware) -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000">
      <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/30 dark:bg-blue-500/20 blur-[150px] rounded-full animate-pulse"></div>
      <div class="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-500/20 dark:bg-purple-600/15 blur-[150px] rounded-full"></div>
      <div class="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-indigo-500/20 dark:bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style="animation-duration: 8s"></div>
    </div>

    <div class="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-24 space-y-8 sm:space-y-12">
      <!-- Offline Banner -->
      <Transition name="page">
        <div v-if="!isOnline" class="glass-card border-amber-500/20 bg-amber-500/5 flex items-center gap-4 py-4">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <p class="text-sm text-amber-200/80 tracking-wide font-light">
            离线回声舱：已进入静谧倾诉模式，心事将封存于胶囊
          </p>
        </div>
      </Transition>

      <!-- Publish Form Section -->
      <section 
        class="glass-card group relative"
        :class="[
          'theme-' + form.theme, 
          { 'opacity-20 blur-[20px] pointer-events-none scale-95': isZenMode || adminLoginVisible }
        ]"
      >
        <div class="space-y-8">
          <!-- Identity Line (Responsive Header) -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative flex-1 group/input w-full">
              <input
                class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                v-model="form.authorAlias"
                type="text"
                placeholder="👤 你的匿名昵称"
                maxlength="20"
                @focus="handleAliasFocus"
              />
              <button 
                class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-400 transition-colors"
                @click="refreshIdentity" 
                title="换一个身份"
              >
                <Dices :size="18" />
              </button>
            </div>
            
            <div class="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
              <div class="flex items-center p-1.5 gap-3">
                <button 
                  v-for="t in themes" 
                  :key="t.value"
                  class="group/dot relative flex items-center justify-center transition-all duration-500"
                  @click="form.theme = t.value"
                >
                  <!-- Outer Halo -->
                  <div 
                    class="absolute inset-0 rounded-full transition-all duration-700 blur-[4px]"
                    :class="form.theme === t.value ? 'bg-white/20 scale-150 animate-pulse' : 'bg-transparent scale-100 group-hover/dot:bg-white/10 group-hover/dot:scale-125'"
                  ></div>
                  
                  <!-- Color Core -->
                  <div 
                    class="relative w-4 h-4 rounded-full border transition-all duration-500"
                    :class="[
                      form.theme === t.value ? 'scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/20 opacity-40 group-hover/dot:opacity-100',
                      'theme-dot-' + t.value
                    ]"
                  ></div>
                </button>
              </div>
            </div>
          </div>

          <!-- Content Area -->
          <div class="relative">
            <textarea
              class="w-full bg-transparent border-none text-lg leading-relaxed placeholder:text-slate-600 focus:outline-none resize-none min-h-[120px]"
              v-model="form.content"
              placeholder="说点什么吧……你的秘密在这里很安全 🤫"
              maxlength="500"
              rows="4"
              @paste="handlePaste"
            ></textarea>
            <div class="absolute bottom-0 right-0 text-[10px] font-mono text-slate-600 tracking-tighter">
              {{ form.content.length }} / 500
            </div>
          </div>

          <!-- Media & Action Bar (Responsive Footer) -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-6 border-t border-white/5">
            <div class="flex flex-wrap items-center gap-3">
              <label class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200 cursor-pointer transition-all active:scale-95">
                <ImagePlus :size="14" />
                <span class="whitespace-nowrap">{{ imagePreview ? (isMobile ? '换图' : '更换图片') : '图片' }}</span>
                <input type="file" accept="image/*" class="hidden" @change="onImageSelect" />
              </label>
              
              <button 
                class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all active:scale-95"
                @click="toggleVoicePanel" 
                v-if="!recordedBlob && !isRecording"
              >
                <Mic :size="14" />
                <span class="whitespace-nowrap">{{ isMobile ? '语音' : '语音留言' }}</span>
              </button>
              
              <!-- Mood Dots -->
              <div class="flex items-center gap-1 sm:gap-2">
                <button 
                  v-for="(emoji, mood) in moodMap" 
                  :key="mood"
                  class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-transparent transition-all hover:border-white/20 active:scale-90"
                  :class="{ 'bg-blue-500/20 border-blue-500/40 scale-110': form.mood === mood }"
                  @click="form.mood = form.mood === mood ? '' : mood"
                >
                  <span class="text-sm sm:text-base grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" :class="{ 'grayscale-0 opacity-100': form.mood === mood }">
                    {{ emoji }}
                  </span>
                </button>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button 
                v-if="offlineQueue.length > 0" 
                class="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                @click="offlineDialogVisible = true"
              >
                <div class="relative">
                  <Archive :size="18" />
                  <span class="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                </div>
              </button>
              
              <button 
                class="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                :class="isOnline ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 text-white' : 'bg-slate-800 text-slate-400 border border-white/5'"
                :disabled="publishing"
                @click="publishMessage"
              >
                <Loader2 v-if="publishing" class="animate-spin" :size="16" />
                <Send v-else :size="16" />
                <span class="whitespace-nowrap">{{ publishing ? '发射中' : (isOnline ? '投入树洞' : '封存胶囊') }}</span>
              </button>
            </div>
          </div>

          <!-- Previews (Floating Style) -->
          <TransitionGroup name="page">
            <div v-if="imagePreview" key="img" class="relative group/img inline-block mt-4">
              <img :src="imagePreview" class="w-24 h-24 object-cover rounded-xl border border-white/10" />
              <button @click="clearImage" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity">✕</button>
            </div>

            <div v-if="showVoicePanel || isRecording || recordedBlob" key="voice" class="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div v-if="!recordedBlob" class="flex flex-col items-center gap-4">
                <button 
                  class="w-full py-3 rounded-xl transition-all font-medium text-sm border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5"
                  :class="{ 'animate-pulse text-red-400 border-red-500/50 bg-red-500/5': isRecording }"
                  @click="toggleRecording"
                >
                  {{ isRecording ? `⏹ 停止录音 (${recordingTime}s)` : '⏺ 点击开始录制 (60s)' }}
                </button>
              </div>
              <div v-else class="flex items-center gap-4">
                <audio controls :src="maskedAudioUrl || rawAudioUrl" class="h-8 flex-1 filter invert opacity-80"></audio>
                <button @click="clearAudio" class="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 :size="18" /></button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </section>

      <!-- Trending Section -->
      <div v-if="trendingTags.length > 0 && !activeTag" class="space-y-4">
        <h3 class="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold ml-1">热门共鸣</h3>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="t in trendingTags" :key="t.id" 
            @click="handleTagClick(t.name)"
            class="px-4 py-2 rounded-full text-xs font-medium bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all flex items-center gap-2 text-slate-400 hover:text-slate-200"
          >
            <Hash :size="12" class="opacity-50" />
            {{ t.name }}
            <span class="opacity-30 font-mono">{{ t.usageCount }}</span>
          </button>
        </div>
      </div>

      <!-- Feed Header -->
      <div class="flex items-center justify-between pt-8">
        <div class="flex items-center gap-6">
          <button 
            v-for="m in ['list', 'graph']" :key="m"
            @click="viewMode = m"
            class="text-xs font-bold tracking-widest transition-all relative py-2"
            :class="viewMode === m ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'"
          >
            {{ m === 'list' ? 'FEED' : 'CONSCIOUSNESS' }}
            <span v-if="viewMode === m" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
          </button>
        </div>
        
      </div>

      <!-- Active Tag Banner -->
      <Transition name="page">
        <div v-if="activeTag" class="flex items-center justify-between px-6 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <div class="flex items-center gap-2">
            <Hash :size="16" class="text-blue-400" />
            <span class="text-sm font-medium text-blue-100">正在查看话题: {{ activeTag }}</span>
          </div>
          <button @click="clearTagFilter" class="text-xs text-blue-400 hover:underline">返回全域</button>
        </div>
      </Transition>

      <!-- Main Feed -->
      <div v-if="viewMode === 'list'" class="space-y-12">
        <div v-if="total > 0" class="space-y-12">
          <TransitionGroup name="msg-list">
            <MessageCard
              v-for="msg in messages"
              :key="msg.id"
              :msg="msg"
              :liked="likedIds.has(msg.id)"
              @like="likeMessage"
              @toggle-comments="toggleComments"
              @delete="deleteMessage"
              @delete-comment="handleDeleteComment"
              @publish-comment="publishComment"
              @tag-click="handleTagClick"
              :isAdmin="isAdmin"
              @admin-ban="handleBanIP"
            />
          </TransitionGroup>

          <!-- Pagination -->
            <!-- Custom Godly Pagination -->
            <div class="flex justify-center pt-16 pb-32">
              <nav class="flex items-center gap-1 p-1 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                <!-- Prev Button -->
                <button 
                  class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 group disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5"
                  :disabled="pageNum <= 1"
                  @click="handlePageChange(pageNum - 1)"
                >
                  <ChevronLeft :size="18" class="text-slate-400 group-hover:text-white transition-colors" />
                </button>

                <!-- Page Numbers -->
                <div class="flex items-center gap-1">
                  <button 
                    v-for="p in totalPages" 
                    :key="p"
                    @click="handlePageChange(p)"
                    class="w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-500 relative group"
                    :class="pageNum === p ? 'text-white' : 'text-slate-500 hover:text-slate-200'"
                  >
                    <!-- Active Glow Effect -->
                    <div 
                      v-if="pageNum === p"
                      class="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/50 animate-in zoom-in duration-300"
                    ></div>
                    <span class="relative z-10">{{ p }}</span>
                  </button>
                </div>

                <!-- Next Button -->
                <button 
                  class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 group disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5"
                  :disabled="pageNum >= totalPages"
                  @click="handlePageChange(pageNum + 1)"
                >
                  <ChevronRight :size="18" class="text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </nav>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-24 text-center space-y-6">
          <div class="text-6xl opacity-20 grayscale">🌌</div>
          <div class="space-y-2">
            <h4 class="text-slate-400 font-medium">这里还是一片虚无</h4>
            <p class="text-xs text-slate-600">你是第一个发现这里的人吗？</p>
          </div>
        </div>
      </div>

      <!-- Graph View -->
      <div v-else class="h-[600px] glass-card overflow-hidden">
        <MindGraph 
          v-if="viewMode === 'graph'" 
          :visible="viewMode === 'graph'"
          @node-click="showNodeDetail"
        />
      </div>
    </div>

    <!-- Professional Zen Overlay (Outside container) -->
    <Transition name="fade">
      <div v-show="isZenMode" class="fixed inset-0 z-[99998] bg-slate-950/80 backdrop-blur-2xl pointer-events-none"></div>
    </Transition>

    <!-- FABs (Fixed Floating) -->
    <div class="fixed right-8 bottom-8 flex flex-col gap-4 z-[100]">
      <!-- Zen Control -->
      <div class="relative group" v-click-outside="() => showZenMenu = false">
        <Transition name="page">
          <div v-if="showZenMenu" class="absolute bottom-full right-0 mb-4 glass-card w-64 p-4 space-y-4">
            <div class="space-y-2">
              <button 
                v-for="s in zenSounds" :key="s.id" 
                @click="selectZenSound(s)"
                class="w-full text-left px-4 py-2 rounded-lg text-xs transition-all flex items-center justify-between"
                :class="currentZenSound?.id === s.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'hover:bg-white/5 text-slate-400'"
              >
                <span>{{ s.icon }} {{ s.name }}</span>
                <div v-if="currentZenSound?.id === s.id" class="flex gap-1">
                  <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0s]"></div>
                  <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0.1s]"></div>
                  <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0.2s]"></div>
                </div>
              </button>
            </div>
            <div class="pt-4 border-t border-white/5">
              <div class="flex items-center justify-between text-[10px] text-slate-500 mb-2 px-1">
                <span>VOLUME</span>
                <span>{{ zenVolume }}%</span>
              </div>
              <el-slider v-model="zenVolume" :show-tooltip="false" @input="updateZenVolume" size="small" />
            </div>
            <button @click="stopZenMode" v-if="isZenMode" class="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 hover:bg-red-500/20 transition-all">TERMINATE ZEN</button>
          </div>
        </Transition>
        <button 
          class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all active:scale-90 border-blue-500/20"
          :class="{ 'bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]': isZenMode }"
          @click="showZenMenu = !showZenMenu"
        >
          <Moon v-if="!isZenMode" :size="20" />
          <Volume2 v-else :size="20" />
        </button>
      </div>

      <!-- Bottle FAB -->
      <button 
        @click="openBottleCenter"
        class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all active:scale-90 border-cyan-500/20"
      >
        <Waves :size="20" />
      </button>

      <!-- Identity FAB -->
      <button 
        @click="showIdentityModal = true"
        class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all active:scale-90 border-purple-500/20"
      >
        <Fingerprint :size="20" />
      </button>
    </div>

    <!-- Modals (Re-styled with Tailwind) -->
    <Transition name="fade">
      <div v-if="showIdentityModal" class="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm" @click.self="showIdentityModal = false">
        <div class="glass-card max-w-sm w-full p-8 space-y-8 animate-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold tracking-tight">🌌 身份备份</h3>
            <button @click="showIdentityModal = false" class="text-slate-500 hover:text-white transition-colors">✕</button>
          </div>
          
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-500 tracking-widest uppercase">恢复密钥</label>
              <div v-if="recoveryKey" class="flex items-center gap-2 p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-blue-400 overflow-hidden">
                <span class="truncate">{{ recoveryKey }}</span>
                <button @click="copyKey" class="p-2 hover:bg-white/5 rounded-lg transition-colors"><Copy :size="14" /></button>
              </div>
              <button v-else @click="handleBackup" class="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm transition-all active:scale-95">生成备份密钥</button>
            </div>

            <div class="relative py-4 flex items-center">
              <div class="flex-grow border-t border-white/5"></div>
              <span class="flex-shrink mx-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">OR</span>
              <div class="flex-grow border-t border-white/5"></div>
            </div>

            <div class="space-y-4">
              <label class="text-[10px] font-bold text-slate-500 tracking-widest uppercase">找回身份</label>
              <div class="flex gap-2">
                <input v-model="inputKey" type="text" class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50" placeholder="treehole-xxx" />
                <button @click="handleRestore" :disabled="!inputKey" class="px-6 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-all">还原</button>
              </div>
            </div>
          </div>
          
          <p class="text-center text-[10px] text-slate-600 leading-relaxed uppercase tracking-tighter">⚠️ 密钥丢失后无法找回，请妥善保管。</p>
        </div>
      </div>
    </Transition>

    <!-- Bottle Modal (Tailwind Refactored) -->
    <el-dialog v-model="bottleVisible" width="min(95vw, 500px)" :show-header="false" custom-class="glass-dialog">
      <div class="py-4 space-y-8">
        <!-- Init State -->
        <div v-if="bottleState === 'init'" class="space-y-12 py-8">
          <div class="flex justify-center gap-8">
            <button @click="bottleState = 'throw'" class="flex flex-col items-center gap-4 group">
              <div class="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:bg-blue-500/20 group-hover:border-blue-500/40 group-hover:-translate-y-2 transition-all">✉️</div>
              <span class="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-widest">扔一个</span>
            </button>
            <button @click="handlePickBottle" class="flex flex-col items-center gap-4 group">
              <div class="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 group-hover:-translate-y-2 transition-all">🔍</div>
              <span class="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-widest">捞一个</span>
            </button>
          </div>
          <button @click="bottleVisible = false" class="w-full text-center text-[10px] font-bold text-slate-600 hover:text-white transition-colors uppercase tracking-widest">返回岸边</button>
        </div>

        <!-- Throw State -->
        <div v-if="bottleState === 'throw'" class="space-y-6">
          <h3 class="text-center font-bold tracking-tight">写下你的心声</h3>
          <textarea v-model="newBottleContent" class="w-full h-48 bg-black/40 rounded-2xl border border-white/10 p-6 text-sm focus:outline-none focus:border-cyan-500/40 transition-all resize-none" placeholder="这封信将随机出现在一个陌生人的海滩上..."></textarea>
          <div class="flex gap-4">
            <button @click="bottleState = 'init'" class="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">取消</button>
            <button @click="handleThrowBottle" :disabled="!newBottleContent.trim()" class="flex-[2] py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all active:scale-95">投向大海</button>
          </div>
        </div>

        <!-- Picking State -->
        <div v-if="bottleState === 'picking'" class="flex flex-col items-center justify-center py-24 space-y-8 animate-pulse">
          <div class="relative">
            <Waves :size="64" class="text-cyan-500/40 animate-bounce" />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">正在深海搜寻缘分...</p>
          <button @click="bottleState = 'init'" class="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-white transition-all">放弃搜寻</button>
        </div>

        <!-- Picked State -->
        <div v-if="bottleState === 'picked' && pickedBottle" class="space-y-8 animate-in zoom-in-95 duration-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl">✉️</div>
              <div>
                <h3 class="text-sm font-bold text-slate-200">来自 {{ pickedBottle.authorAlias }} 的漂流瓶</h3>
                <p class="text-[10px] text-slate-500 uppercase tracking-tighter">{{ formatTime(pickedBottle.createTime) }}</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">{{ pickedBottle.theme }}</span>
          </div>

          <div class="p-6 bg-black/40 rounded-2xl border border-white/10 italic text-sm leading-relaxed text-slate-300">
            "{{ pickedBottle.content }}"
          </div>

          <div class="flex gap-4">
            <button @click="handleReturnBottle" class="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">放回大海</button>
            <button @click="bottleState = 'reply'" class="flex-[2] py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all active:scale-95">回信给 Ta</button>
          </div>
        </div>

        <!-- Reply State -->
        <div v-if="bottleState === 'reply'" class="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <h3 class="text-center font-bold tracking-tight">给予回响</h3>
          <textarea v-model="replyContent" class="w-full h-48 bg-black/40 rounded-2xl border border-white/10 p-6 text-sm focus:outline-none focus:border-cyan-500/40 transition-all resize-none" placeholder="写下你的温暖回应..."></textarea>
          <div class="flex gap-4">
            <button @click="bottleState = 'picked'" class="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">返回</button>
            <button @click="handleReplyBottle" :disabled="!replyContent.trim()" class="flex-[2] py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs shadow-lg shadow-blue-600/20 transition-all active:scale-95">寄出回音</button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Godly Admin Authentication Overlay -->
    <Transition name="fade">
      <div v-if="adminLoginVisible" class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/40 backdrop-blur-[80px]">
        <div class="w-full max-w-md p-12 space-y-12 text-center animate-in fade-in zoom-in-95 duration-700">
          <div class="space-y-4">
            <h2 class="text-[10px] uppercase tracking-[0.6em] text-red-500 font-bold opacity-80">System.Authorize</h2>
            <h1 class="text-4xl font-light tracking-tighter text-white/90">Authentication Required</h1>
          </div>
          
          <div class="relative group">
            <input 
              v-model="adminPassword" 
              type="password" 
              autofocus
              class="w-full bg-transparent border-b border-white/10 py-6 text-4xl text-center font-light tracking-[0.4em] focus:outline-none focus:border-red-500/60 transition-all placeholder:text-white/5" 
              placeholder="••••"
              @keyup.enter="handleAdminLogin"
            />
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-red-500 transition-all duration-700 group-focus-within:w-full shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
          </div>

          <div class="flex flex-col gap-4 pt-8">
            <button @click="handleAdminLogin" class="group relative py-4 px-8 overflow-hidden rounded-full border border-white/10 hover:border-red-500/40 transition-all duration-500">
              <span class="relative z-10 text-[10px] uppercase tracking-[0.4em] text-white/60 group-hover:text-white">Initialize Root Access</span>
              <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
            <button @click="adminLoginVisible = false" class="text-[9px] uppercase tracking-[0.2em] text-white/20 hover:text-white/60 transition-colors">Abort Connection</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Godly Admin Command Dock -->
    <Transition name="page">
      <div v-if="isAdmin" class="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[40] w-[95%] sm:w-auto">
        <div class="glass-card !p-3 sm:!p-4 flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-6 shadow-2xl shadow-blue-500/20">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldAlert :size="14" />
            <span class="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Root Auth</span>
          </div>
          
          <div class="h-4 w-px bg-white/10 hidden sm:block"></div>
          
          <div class="flex items-center gap-1 sm:gap-2">
            <button @click="showBlacklistModal = true" class="p-2 sm:px-4 sm:py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all flex items-center gap-2">
              <Users :size="16" />
              <span class="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">Blacklist</span>
            </button>
            <button @click="showPasswordModal = true" class="p-2 sm:px-4 sm:py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all flex items-center gap-2">
              <Lock :size="16" />
              <span class="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">Security</span>
            </button>
            <button @click="exitAdmin" class="p-2 sm:px-4 sm:py-2 rounded-xl bg-red-500/5 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-2 border border-red-500/10">
              <LogOut :size="16" />
              <span class="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Blacklist Management Modal -->
    <el-dialog v-model="showBlacklistModal" width="min(95vw, 600px)" :show-header="false" custom-class="glass-dialog">
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
            <button @click="handleUnban(item.ip)" class="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all opacity-0 group-hover:opacity-100">Release</button>
          </div>
          <div v-if="blacklist.length === 0" class="py-12 text-center text-[10px] text-slate-600 uppercase tracking-widest">The void is empty</div>
        </div>

        <button @click="showBlacklistModal = false" class="w-full py-4 rounded-xl text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Close Registry</button>
      </div>
    </el-dialog>

    <!-- Change Password Modal -->
    <el-dialog v-model="showPasswordModal" width="min(95vw, 400px)" :show-header="false" custom-class="glass-dialog">
      <div class="py-6 space-y-8 text-center">
        <div class="space-y-1">
          <h2 class="text-sm font-bold tracking-widest uppercase text-blue-400">Security.Update</h2>
          <p class="text-[10px] text-slate-500 uppercase">Updating root credentials</p>
        </div>

        <div class="space-y-4">
          <input v-model="pwdForm.oldPassword" type="password" class="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/40 transition-all text-center tracking-widest" placeholder="CURRENT PASSWORD" />
          <input v-model="pwdForm.newPassword" type="password" class="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/40 transition-all text-center tracking-widest" placeholder="NEW PASSWORD" />
        </div>

        <div class="flex gap-4">
          <button @click="showPasswordModal = false" class="flex-1 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white">Cancel</button>
          <button @click="handleChangePassword" class="flex-[2] py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Update Key</button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api, { 
  saveToken, getToken, removeToken, hasMsgToken, hasCmtToken, MSG_TOKEN_KEY, CMT_TOKEN_KEY, 
  getTrendingTags, getMessagesByTag,
  throwBottle, pickBottle, replyBottle, returnBottle,
  backupIdentity, restoreIdentity
} from '@/api'
import MessageCard from '@/components/MessageCard.vue'
import MindGraph from '@/components/MindGraph.vue'
import { applyVoiceMask } from '@/utils/audioProcessor'
import { getOrGenerateIdentity, generateRandomIdentity } from '@/utils/identity'
import { 
  Dices, Fingerprint, ImagePlus, Mic, Archive, Send, Loader2, Sparkles, Hash, Copy, Waves, Volume2, Moon, Trash2 
} from 'lucide-vue-next'
import { formatTime } from '@/utils/time.js'

// --- Custom Directive for click-outside ---
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

// --- UI State ---
const viewMode = ref('list') 
const nodeDetailVisible = ref(false)
const selectedNodeMsg = ref(null)

// --- Offline Echo Cabin State ---
const isOnline = ref(navigator.onLine)
const showIdentityModal = ref(false)
const recoveryKey = ref('')
const inputKey = ref('')
const offlineQueue = ref(JSON.parse(localStorage.getItem('offline_capsules') || '[]'))
const offlineDialogVisible = ref(false)
const adminLoginVisible = ref(false)
const adminPassword = ref('')
const showBlacklistModal = ref(false)
const showPasswordModal = ref(false)
const blacklist = ref([])
const readIds = ref(new Set(JSON.parse(localStorage.getItem('read_message_ids') || '[]')))
const markAsRead = (id) => {
  readIds.value.add(id)
  localStorage.setItem('read_message_ids', JSON.stringify([...readIds.value]))
}

const pwdForm = reactive({ oldPassword: '', newPassword: '' })

function deleteOfflineCapsule(index) {
  offlineQueue.value.splice(index, 1)
  localStorage.setItem('offline_capsules', JSON.stringify(offlineQueue.value))
  if (offlineQueue.value.length === 0) {
    offlineDialogVisible.value = false
  }
}

function syncOfflineMessages() {
  if (offlineQueue.value.length === 0) return
  ElMessage.success(`正在为您发射封存的 ${offlineQueue.value.length} 条心事胶囊...`)
  const tasks = offlineQueue.value.map(msg => api.post('/messages/publish', msg))
  Promise.all(tasks).then(() => {
    offlineQueue.value = []
    localStorage.removeItem('offline_capsules')
    fetchMessages()
    ElMessage.success('✨ 所有离线胶囊已成功抵达星空')
  }).catch(() => {
    ElMessage.error('部分胶囊发射失败，将在下次网络恢复时重试')
  })
}

// 监听网络状态
const handleOnline = () => { isOnline.value = true; syncOfflineMessages(); }
const handleOffline = () => { isOnline.value = false; ElMessage.warning('你已进入离线回声舱'); }

const handleBackup = async () => {
  try {
    const res = await backupIdentity()
    recoveryKey.value = res.data
    ElMessage.success('备份密钥已生成')
  } catch (err) {}
}

const handleRestore = async () => {
  try {
    const res = await restoreIdentity(inputKey.value)
    if (res.code === 200) {
      localStorage.setItem('treehole_identity', JSON.stringify({ userId: res.data, createdAt: Date.now() }))
      ElMessage.success('身份还原成功，正在重连宇宙...')
      setTimeout(() => window.location.reload(), 1500)
    }
  } catch (err) {}
}

const copyKey = () => {
  navigator.clipboard.writeText(recoveryKey.value)
  ElMessage.success('已复制')
}

// --- Drift Bottle State ---
const bottleVisible = ref(false)
const bottleState = ref('init') 
const newBottleContent = ref('')
const pickedBottle = ref(null)
const replyContent = ref('')
const replied = ref(false)

function openBottleCenter() {
  bottleVisible.value = true
  bottleState.value = 'init'
  newBottleContent.value = ''
  replyContent.value = ''
  replied.value = false
}

async function handleThrowBottle() {
  try {
    await throwBottle({ content: newBottleContent.value, authorAlias: form.authorAlias || '匿名用户', theme: form.theme || 'default' })
    ElMessage.success('瓶子已随海浪飘向远方...')
    bottleVisible.value = false
  } catch (e) {}
}

async function handlePickBottle() {
  bottleState.value = 'picking'
  try {
    await new Promise(r => setTimeout(r, 1500))
    const res = await pickBottle()
    if (res.data) {
      pickedBottle.value = res.data
      bottleState.value = 'picked'
    } else {
      ElMessage.info('海面上空荡荡的')
      bottleState.value = 'init'
    }
  } catch (e) { bottleState.value = 'init' }
}

async function handleReplyBottle() {
  if (!replyContent.value.trim()) return
  try {
    await replyBottle(pickedBottle.value.id, replyContent.value)
    ElMessage.success('你的回信已顺着海流出发 ✨')
    bottleVisible.value = false
  } catch (e) {}
}

async function handleReturnBottle() {
  try {
    await returnBottle(pickedBottle.value.id)
    ElMessage.success('瓶子已重回大海的怀抱')
    bottleVisible.value = false
  } catch (e) {}
}



// --- Zen Mode State ---
const isZenMode = ref(false)
const showZenMenu = ref(false)
const currentZenSound = ref(null)
const zenSounds = [
  { id: 'rain', name: '深夜细雨', icon: '🌧️', url: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-on-window-loop-2440.mp3' },
  { id: 'train', name: '长途列车', icon: '🚂', url: 'https://www.soundjay.com/transportation/train-passing-1.mp3' },
  { id: 'sea', name: '深海潮汐', icon: '🌊', url: 'https://assets.mixkit.co/sfx/preview/mixkit-ocean-waves-loop-1196.mp3' }
]
let zenAudio = null
const zenVolume = ref(80)

function updateZenVolume() { if (zenAudio) zenAudio.volume = zenVolume.value / 100 }
function stopZenMode() { isZenMode.value = false; showZenMenu.value = false; fadeAudio(0).then(() => currentZenSound.value = null) }

function fadeAudio(targetVolume, duration = 1000) {
  if (!zenAudio) return Promise.resolve()
  return new Promise(resolve => {
    const startVolume = zenAudio.volume
    const steps = 30
    const stepValue = (targetVolume - startVolume) / steps
    let current = 0
    const timer = setInterval(() => {
      current++
      zenAudio.volume = Math.max(0, Math.min(1, startVolume + (stepValue * current)))
      if (current >= steps) {
        clearInterval(timer)
        if (targetVolume === 0) zenAudio.pause()
        resolve()
      }
    }, duration / steps)
  })
}

function selectZenSound(sound) {
  isZenMode.value = true
  if (currentZenSound.value?.id === sound.id) { stopZenMode(); return }
  if (!zenAudio) { zenAudio = new Audio(); zenAudio.loop = true }
  
  const performPlay = () => {
    currentZenSound.value = sound
    zenAudio.src = sound.url
    zenAudio.volume = 0
    zenAudio.oncanplay = () => { zenAudio.play().then(() => fadeAudio(zenVolume.value / 100)) }
  }
  if (currentZenSound.value) fadeAudio(0, 300).then(performPlay)
  else performPlay()
}

async function likeMessage(msg) {
  if (likedIds.has(msg.id)) { ElMessage.info('已经点过赞啦 ❤️'); return }
  try {
    await api.put(`/message/like/${msg.id}`)
    likedIds.add(msg.id)
    msg.likes = (msg.likes || 0) + 1
  } catch (e) {}
}

async function toggleComments(msg) {
  msg._showComments = !msg._showComments
  if (msg._showComments) {
    msg._read = true
    markAsRead(msg.id)
    try {
      const res = await api.get(`/comment/list/${msg.id}`)
      msg._comments = res.data || []
    } catch (e) {}
  }
}

async function publishComment(msg) {
  if (!msg._commentText.trim() && !msg._commentImage) return
  msg._commenting = true
  try {
    await api.post('/comment', {
      messageId: msg.id,
      content: msg._commentText.trim(),
      imageUrl: msg._commentImage,
      parentId: msg._replyToId || null
    })
    ElMessage.success('评论成功 ✨')
    msg._commentText = ''; msg._commentImage = null; msg._replyToId = null
    const cmtRes = await api.get(`/comment/list/${msg.id}`)
    msg._comments = cmtRes.data || []
    msg.commentCount = (msg.commentCount || 0) + 1
  } catch (e) {
  } finally { msg._commenting = false }
}

async function deleteMessage(msg) {
  if (!msg.isOwner && !getToken(MSG_TOKEN_KEY, msg.id) && !isAdmin.value) {
    ElMessage.warning('你没有删除权限'); return
  }
  try {
    await ElMessageBox.confirm('确定要删除这条树洞吗？', '提示', { type: 'warning' })
    await api.delete(`/message/${msg.id}`)
    ElMessage.success('已删除')
    fetchMessages()
  } catch (e) {}
}

async function handleDeleteComment({msg, comment}) {
  if (!comment.isOwner && !getToken(CMT_TOKEN_KEY, comment.id) && !isAdmin.value) {
    ElMessage.warning('你没有删除权限'); return
  }
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', { type: 'warning' })
    await api.delete(`/comment/${comment.id}`)
    ElMessage.success('评论已删除')
    const res = await api.get(`/comment/list/${msg.id}`)
    msg._comments = res.data || []
    msg.commentCount = Math.max(0, msg.commentCount - 1)
  } catch (e) {}
}

function handleTagClick(tag) { activeTag.value = tag; pageNum.value = 1; fetchMessages() }
function clearTagFilter() { activeTag.value = ''; pageNum.value = 1; fetchMessages() }
function handlePageChange(p) { pageNum.value = p; fetchMessages(); window.scrollTo({ top: 0, behavior: 'smooth' }) }
function showNodeDetail(msg) { selectedNodeMsg.value = msg; nodeDetailVisible.value = true }

// --- Form & Feed ---
const form = reactive({ authorAlias: '', content: '', mood: '', theme: 'default' })

// --- Admin State ---
const isAdmin = ref(!!localStorage.getItem('treehole_admin_token'))

// --- Admin Backdoor Watcher ---
watch(() => form.content, (val) => {
  if (val && val.trim() === 'sudo su - root') {
    adminLoginVisible.value = true
    adminPassword.value = ''
    form.content = ''
  } else if (val && val.trim() === 'exit' && isAdmin.value) {
    isAdmin.value = false
    localStorage.removeItem('treehole_admin_token')
    form.content = ''
    ElMessage.info('权限已撤销，回归凡人身份。')
  }
})

async function handleAdminLogin() {
  if (!adminPassword.value.trim()) return
  try {
    const res = await api.post('/admin/login', { password: adminPassword.value })
    if (res.data) {
      isAdmin.value = true
      localStorage.setItem('treehole_admin_token', res.data)
      adminLoginVisible.value = false
      ElMessage({
        message: '👑 ACCESS GRANTED. 欢迎回来，最高权限者。',
        type: 'success',
        duration: 3000,
        showClose: true
      })
      fetchBlacklist()
    }
  } catch (e) {
    adminPassword.value = ''
  }
}

async function fetchBlacklist() {
  try {
    const res = await api.get('/admin/blacklist')
    blacklist.value = res.data || []
  } catch (e) {}
}

async function handleUnban(ip) {
  try {
    await api.delete(`/admin/unban?ip=${ip}`)
    ElMessage.success('IP 已解封')
    fetchBlacklist()
  } catch (e) {}
}

async function handleChangePassword() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword) return
  try {
    await api.post('/admin/resetPassword', pwdForm)
    ElMessage.success('密码修改成功，请重新登录')
    exitAdmin()
  } catch (e) {}
}

function exitAdmin() {
  isAdmin.value = false
  localStorage.removeItem('treehole_admin_token')
  showBlacklistModal.value = false
  showPasswordModal.value = false
  ElMessage.info('管理员模式已退出')
}

async function handleBanIP(ip) {
  try {
    await ElMessageBox.prompt('请输入封禁理由', '封禁操作', {
      confirmButtonText: '确定封禁',
      cancelButtonText: '取消',
      inputPlaceholder: '违反社区守则'
    }).then(async ({ value }) => {
      await api.post('/admin/ban', { ip, reason: value || '违反社区守则' })
      ElMessage.success('已封禁该 IP')
      fetchBlacklist()
    })
  } catch (e) {}
}
const publishing = ref(false)
const messages = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const trendingTags = ref([])
const activeTag = ref('')
const likedIds = reactive(new Set())
const themes = [
  { value: 'default' }, 
  { value: 'autumn' }, 
  { value: 'starry' }, 
  { value: 'retro' }
]
const moodMap = { '开心': '😄', '难过': '😢', '愤怒': '😡', '平静': '😌', '迷茫': '🤔' }

function refreshIdentity() { form.authorAlias = generateRandomIdentity() }
function handleAliasFocus() { if (form.authorAlias.includes('_')) form.authorAlias = '' }

async function fetchTrending() {
  try { const res = await getTrendingTags(12); trendingTags.value = res.data || [] } catch(e) {}
}

async function fetchMessages() {
  try {
    const res = activeTag.value 
      ? await getMessagesByTag(activeTag.value, pageNum.value, pageSize.value)
      : await api.get('/message/list', { params: { pageNum: pageNum.value, pageSize: pageSize.value } })
    messages.value = (res.data.records || []).map(m => ({ 
      ...m, 
      _showComments: false, 
      _comments: [], 
      _commentText: '', 
      _commentImage: null, 
      _replyToId: null, 
      _commenting: false, 
      _read: readIds.value.has(m.id)
    }))
    total.value = Number(res.data.total)
  } catch (e) {}
}

async function publishMessage() {
  if (!form.content.trim() && !imageFile.value && !recordedBlob.value) return
  if (!isOnline.value) { saveToOfflineQueue(); return }
  publishing.value = true
  try {
    let imageUrl = '', audioUrl = ''
    if (imageFile.value) {
      const fd = new FormData(); fd.append('file', imageFile.value)
      const res = await api.post('/file/upload', fd); imageUrl = res.data
    }
    if (maskedAudioBlob.value) {
      const fd = new FormData(); fd.append('file', maskedAudioBlob.value, 'voice.wav')
      const res = await api.post('/file/upload', fd); audioUrl = res.data
    }
    await api.post('/message', { ...form, imageUrl, audioUrl })
    ElMessage.success('留言成功 🎉')
    form.content = ''; clearImage(); clearAudio(); pageNum.value = 1
    fetchMessages(); fetchTrending()
  } catch (e) {
    if (!navigator.onLine) saveToOfflineQueue()
  } finally { publishing.value = false }
}

function saveToOfflineQueue() {
  offlineQueue.value.push({ ...form, id: Date.now(), createTime: new Date().toISOString() })
  localStorage.setItem('offline_capsules', JSON.stringify(offlineQueue.value))
  ElMessage.success('已封存为离线胶囊 💊')
  form.content = ''; clearImage(); clearAudio()
}

// --- Image & Audio Logic ---
const imageFile = ref(null), imagePreview = ref('')
const showVoicePanel = ref(false), isRecording = ref(false), recordingTime = ref(0), recordedBlob = ref(null), rawAudioUrl = ref(''), maskedAudioBlob = ref(null), maskedAudioUrl = ref('')
function onImageSelect(e) { const f = e.target.files[0]; if (f) { imageFile.value = f; imagePreview.value = URL.createObjectURL(f) } }
function clearImage() { imageFile.value = null; imagePreview.value = '' }
function toggleVoicePanel() { showVoicePanel.value = !showVoicePanel.value }
function clearAudio() { recordedBlob.value = null; rawAudioUrl.value = ''; maskedAudioUrl.value = ''; showVoicePanel.value = false }

function handlePaste(event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        imageFile.value = file;
        imagePreview.value = URL.createObjectURL(file);
        ElMessage.success('已从剪贴板捕获图片 📸');
      }
    }
  }
}

// --- Responsive Helper ---
const isMobile = ref(false)
const checkMobile = () => { isMobile.value = window.innerWidth < 640 }

// --- Lifecycle ---
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  form.authorAlias = getOrGenerateIdentity()
  fetchMessages(); fetchTrending()
  window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline)
})
</script>

<style>
/* Global Glass Style for ElDialog */
.glass-dialog {
  background-color: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(40px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 2rem !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}
.glass-dialog .el-dialog__header { display: none; }
.glass-dialog .el-dialog__body { padding: 2rem !important; color: var(--color-slate-200); }

.cyber-pagination {
  margin-top: 2rem !important;
  --el-pagination-bg-color: transparent !important;
  --el-pagination-button-bg-color: transparent !important;
}

.cyber-pagination :deep(.el-pager li) {
  width: 40px !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 14px !important;
  color: #64748b !important;
  margin: 0 6px !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-weight: 700 !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.cyber-pagination :deep(.el-pager li.is-active) {
  background: rgba(59, 130, 246, 0.15) !important;
  color: #60a5fa !important;
  border: 1px solid rgba(59, 130, 246, 0.5) !important;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2), inset 0 0 10px rgba(59, 130, 246, 0.1) !important;
  transform: translateY(-4px) scale(1.1) !important;
}

.cyber-pagination :deep(.el-pager li:not(.is-active):hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  transform: translateY(-2px) !important;
}

.cyber-pagination :deep(button.btn-prev), 
.cyber-pagination :deep(button.btn-next) {
  width: 40px !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 14px !important;
  color: #64748b !important;
  transition: all 0.3s !important;
}

.cyber-pagination :deep(button:not(:disabled):hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

.msg-list-enter-active, .msg-list-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.msg-list-enter-from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
.msg-list-leave-to { opacity: 0; transform: scale(0.95); }
.msg-list-move { transition: transform 0.5s ease; }
</style>
