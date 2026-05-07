import { Component, OnInit, OnDestroy, signal, effect, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User, Message, Conversation } from '../../models/interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-2 py-md-5 mt-md-4 px-0 px-md-3">
      <div class="row g-0 glass-panel shadow-lg rounded-4 overflow-hidden" 
           style="height: 85vh; min-height: 500px;"
           [class.chat-active]="showChatMobile()">
        
        <!-- Conversations List (Branded Sidebar) -->
        <div class="col-md-4 col-lg-3 border-end h-100 d-flex flex-column sidebar-column" style="background: #fff;">
          <div class="p-4 border-bottom bg-forest text-white">
            <h4 class="mb-0 fw-bold d-flex align-items-center gap-2">
              <i class="bi bi-chat-dots-fill"></i>
              Messages
            </h4>
          </div>
          
          <div class="flex-grow-1 overflow-auto custom-scrollbar">
            <div class="list-group list-group-flush" *ngIf="conversations().length > 0">
              <a href="javascript:void(0)" class="list-group-item list-group-item-action chat-list-item px-3 py-3 border-bottom" 
                 *ngFor="let conv of conversations()" 
                 [class.active-chat]="selectedUser() === conv.user._id"
                 (click)="selectConversation(conv)">
                <div class="d-flex align-items-center">
                  <div class="position-relative me-3 cursor-pointer" [routerLink]="['/profile', conv.user._id]">
                    <img [src]="getImageUrl(conv.user.profilePhoto || conv.user.profilePic, conv.user.name || conv.user.firstName)" 
                         class="chat-avatar rounded-circle border hover-lift" alt="Avatar" width="50" height="50">
                    <span *ngIf="conv.user.isOnline" class="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle pulse-online" style="width: 12px; height: 12px;"></span>
                  </div>
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="d-flex justify-content-between">
                      <h6 class="mb-0 fw-bold text-truncate">{{ conv.user.name || (conv.user.firstName + ' ' + conv.user.lastName) }}</h6>
                      <small class="text-muted" style="font-size: 10px;">{{ conv.updatedAt | date:'shortTime' }}</small>
                    </div>
                    <small class="text-muted d-block text-truncate small d-flex align-items-center gap-1">
                      <i *ngIf="conv.lastMessage?.file?.type === 'image'" class="bi bi-camera-fill" style="font-size: 12px; color: #666;"></i>
                      <i *ngIf="conv.lastMessage?.file && conv.lastMessage?.file?.type !== 'image'" class="bi bi-file-earmark-text-fill" style="font-size: 12px; color: #666;"></i>
                      {{ conv.lastMessage?.text || (conv.lastMessage?.file?.type === 'image' ? 'Photo' : (conv.lastMessage?.file ? 'File' : 'No messages')) }}
                    </small>
                  </div>
                  <span class="badge bg-danger rounded-pill ms-2" *ngIf="conv.unreadCount > 0">{{ conv.unreadCount }}</span>
                </div>
              </a>
            </div>
            <div *ngIf="conversations().length === 0 && !loading" class="p-5 text-center text-muted">
              <i class="bi bi-chat-dots fs-1 mb-3 d-block opacity-25"></i>
              <p>No messages yet.</p>
            </div>
            <div *ngIf="loading" class="p-5 text-center">
              <div class="spinner-border text-success spinner-border-sm"></div>
            </div>
          </div>
        </div>
        
        <!-- Chat Area (Fluid) -->
        <div class="col-md-8 col-lg-9 h-100 d-flex flex-column chat-column" *ngIf="selectedUser()" style="background: #f0f2f5;">
          <!-- Selection Mode Toolbar -->
          <div *ngIf="selectionMode" class="p-3 shadow-sm d-flex align-items-center justify-content-between sticky-top z-3" style="background: #f0f2f5; animation: slideDown 0.2s ease;">
            <div class="d-flex align-items-center gap-3">
              <button class="btn btn-link p-0" style="color: #096a4d;" (click)="cancelSelection()">
                <i class="bi bi-x-lg fs-4"></i>
              </button>
              <h6 class="mb-0 fw-bold" style="color: #096a4d;">{{ selectedMessageIds.size }} selected</h6>
            </div>
            <div class="d-flex align-items-center gap-3">
              <button class="btn btn-link p-0" style="color: #096a4d;" (click)="deleteSelected()" [disabled]="selectedMessageIds.size === 0">
                <i class="bi bi-trash3 fs-5"></i>
              </button>
            </div>
          </div>

          <!-- Chat Header -->
          <div class="p-3 shadow-sm d-flex align-items-center justify-content-between bg-white border-bottom sticky-top z-3">
            <div class="d-flex align-items-center">
              <button class="btn btn-link text-dark d-md-none me-2 p-0" (click)="backToList()">
                <i class="bi bi-arrow-left fs-4"></i>
              </button>
              <div class="position-relative me-3">
                <img [src]="getImageUrl(selectedUserProfilePhoto, selectedUserName)" 
                     class="rounded-circle border shadow-sm" style="width: 48px; height: 48px; object-fit: cover;" alt="Header Avatar">
                <span *ngIf="isSelectedUserOnline()" class="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle pulse-online" style="width: 14px; height: 14px;"></span>
              </div>
              <div>
                <h6 class="mb-0 fw-bold">{{ selectedUserName }}</h6>
                <small class="text-forest small fw-medium" *ngIf="typingUser() === selectedUser()">
                   typing...
                </small>
                <small class="text-muted small d-flex align-items-center gap-1" *ngIf="typingUser() !== selectedUser() && isSelectedUserOnline()">
                   <span class="p-1 bg-success rounded-circle" style="width: 8px; height: 8px;"></span> Online
                </small>
              </div>
            </div>
            
            <div class="d-flex align-items-center gap-3">
              <div *ngIf="selectedPropertyTitle" class="badge bg-forest bg-opacity-10 text-forest px-3 py-2 rounded-pill small border d-none d-lg-block">
                🏠 {{ selectedPropertyTitle }}
              </div>
              
              <div class="position-relative">
                <button class="btn btn-link text-muted p-2 hover-bg-light rounded-circle" 
                        (click)="toggleChatMenu($event)" 
                        title="Menu">
                  <i class="bi bi-three-dots-vertical fs-5"></i>
                </button>
                
                <!-- WhatsApp Style Dropdown -->
                <div *ngIf="showChatMenu" 
                     class="whatsapp-dropdown shadow-lg py-2" 
                     (click)="$event.stopPropagation()">
                  <div class="dropdown-item-wa contact-info-item d-flex align-items-center gap-3 px-3 py-2" (click)="viewContactInfo()">
                    <i class="bi bi-info-circle fs-5"></i>
                    <span>Contact info</span>
                  </div>
                  <div class="dropdown-item-wa d-flex align-items-center gap-3 px-3 py-2" (click)="selectMessages()">
                    <i class="bi bi-check2-square fs-5"></i>
                    <span>Select messages</span>
                  </div>
                  <div class="dropdown-item-wa d-flex align-items-center gap-3 px-3 py-2" (click)="isUserBlockedByMe() ? unblockUser() : blockUser()">
                    <i class="bi" [ngClass]="isUserBlockedByMe() ? 'bi-check-circle' : 'bi-slash-circle'"></i>
                    <span>{{ isUserBlockedByMe() ? 'Unblock' : 'Block' }}</span>
                  </div>
                  <div class="dropdown-item-wa d-flex align-items-center gap-3 px-3 py-2" (click)="confirmClearChat()">
                    <i class="bi bi-dash-circle fs-5"></i>
                    <span>Clear chat</span>
                  </div>
                  <div class="dropdown-item-wa d-flex align-items-center gap-3 px-3 py-2" (click)="confirmDeleteChat()">
                    <i class="bi bi-trash3 fs-5"></i>
                    <span>Delete chat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Chat Messages -->
          <div class="flex-grow-1 overflow-auto px-2 px-md-4 py-3 custom-scrollbar" id="chatContainer" #scrollFrame>
            <div class="d-flex flex-column gap-3">
              <ng-container *ngFor="let group of getGroupedMessages()">
                <div class="d-flex justify-content-center my-4" style="z-index: 10;">
                   <span class="badge rounded shadow-sm px-3 py-1 fw-bold text-uppercase" 
                         style="background: #e1f5fe; color: #516370; border: 1px solid rgba(0,0,0,0.08); font-size: 10.5px; letter-spacing: 0.5px;">
                      {{ group.date }}
                   </span>
                </div>

                <!-- Message Item -->
                <div *ngFor="let msg of group.messages" 
                     class="d-flex align-items-center mb-3 message-row-container"
                     [class.justify-content-end]="isSentByMe(msg)"
                     [class.justify-content-start]="!isSentByMe(msg)"
                     [class.selection-mode]="selectionMode"
                     [class.selected-bg]="selectionMode && selectedMessageIds.has(msg._id!)"
                     (click)="selectionMode ? toggleMessageSelection(msg._id!) : null">
                  
                  <!-- Selection Checkbox -->
                  <div *ngIf="selectionMode" class="px-3" style="animation: fadeIn 0.3s ease;">
                    <div class="form-check custom-checkbox">
                      <input class="form-check-input" type="checkbox" 
                             [checked]="selectedMessageIds.has(msg._id!)"
                             (click)="$event.stopPropagation(); toggleMessageSelection(msg._id!)">
                    </div>
                  </div>

                  <!-- Content Column -->
                  <div class="d-flex flex-column"
                       [class.align-self-end]="isSentByMe(msg)"
                       [class.align-self-start]="!isSentByMe(msg)"
                       [style.max-width]="selectionMode ? 'calc(100% - 60px)' : '75%'">
                    
                    <!-- Bubble & Overlays Wrapper -->
                    <div class="message-wrapper position-relative d-flex align-items-center gap-1 gap-md-2 px-1 px-md-3" 
                         [class.flex-row-reverse]="isSentByMe(msg)">
                      
                      <!-- Actual Bubble -->
                      <div class="ms-bubble shadow-sm cursor-text position-relative"
                           [ngClass]="isSentByMe(msg) ? 'ms-bubble-sent' : 'ms-bubble-received'">
                        
                        <!-- File Attachment (Image) -->
                        <div *ngIf="msg.file?.type === 'image'" class="media-container cursor-pointer overflow-hidden rounded mb-1" 
                             (click)="viewingImageUrl = getImageUrl(msg.file!.url)">
                          <img [src]="getImageUrl(msg.file!.url)" class="img-fluid" style="display: block; width: 100%; max-height: 350px; object-fit: cover;">
                        </div>

                        <!-- File Attachment (Other) -->
                        <div *ngIf="msg.file && msg.file.type !== 'image'" class="mb-2 p-2 rounded bg-dark bg-opacity-10 border border-white border-opacity-10">
                           <div class="d-flex align-items-center gap-2">
                              <i class="bi bi-file-earmark-text fs-4 text-forest"></i>
                              <div class="overflow-hidden">
                                <div class="text-truncate small fw-bold text-dark">{{ msg.file.name }}</div>
                                <small class="text-muted" style="font-size: 10px;">{{ (msg.file.size / 1024).toFixed(1) }} KB</small>
                              </div>
                              <a [href]="getImageUrl(msg.file.url)" target="_blank" class="ms-auto btn btn-sm btn-light rounded-circle" (click)="$event.stopPropagation()">
                                <i class="bi bi-download"></i>
                              </a>
                           </div>
                        </div>

                        <!-- Text / Caption -->
                        <div *ngIf="msg.text" [innerHtml]="formatText(msg.text)" [class.mt-1]="msg.file"></div>

                        <!-- Reactions Display -->
                        <div *ngIf="msg.reactions && msg.reactions.length > 0" 
                             class="reactions-display d-flex flex-wrap gap-1 position-absolute"
                             [ngClass]="isSentByMe(msg) ? 'end-0' : 'start-0'"
                             style="bottom: -12px; z-index: 5;">
                            <div *ngFor="let r of groupReactions(msg.reactions)" 
                                 class="reaction-badge bg-white shadow-sm border rounded-pill d-flex align-items-center gap-1 px-0.8 py-0.8 cursor-pointer hover-scale"
                                 style="border-color: #ffd107ff !important;"
                                 (click)="$event.stopPropagation(); toggleReaction(msg, r.code)">
                              <img [src]="getEmojiUrl(r.code)" width="20" height="20">
                              <span class="small fw-bold" style="font-size: 10px; color: #555;" *ngIf="r.count > 1">{{ r.count }}</span>
                            </div>
                        </div>

                        <!-- Timestamp inside bubble -->
                        <div class="msg-timestamp d-flex align-items-center gap-1">
                          <span>{{ msg.createdAt | date:'shortTime' }}</span>
                          <i *ngIf="isSentByMe(msg)" class="bi bi-check2-all fw-bold" [class.text-primary]="msg.read" style="font-size: 15px;"></i>
                        </div>
                      </div> <!-- End Bubble -->

                      <!-- Reactions Overlay -->
                      <div *ngIf="activeReactionMsgId === msg._id" 
                           class="reactions-overlay d-flex gap-1 p-1 bg-white shadow-lg border rounded-pill position-absolute" 
                           [ngClass]="isSentByMe(msg) ? 'top-0 end-0 translate-middle-y' : 'top-0 start-0 translate-middle-y'"
                           style="z-index: 1050; margin-top: -10px;">
                         <div *ngFor="let emoji of liveEmojis.slice(0, 5)" class="reaction-item p-1 hover-bg-light rounded-circle cursor-pointer" 
                              (click)="$event.stopPropagation(); toggleReaction(msg, emoji.code)">
                           <img [src]="emoji.gif" width="20" height="20">
                         </div>

                         <ng-container *ngIf="expandedReactionMsgId === msg._id">
                           <div *ngFor="let emoji of liveEmojis.slice(5)" class="reaction-item p-1 hover-bg-light rounded-circle cursor-pointer" 
                                (click)="$event.stopPropagation(); toggleReaction(msg, emoji.code)">
                             <img [src]="emoji.gif" width="22" height="22">
                           </div>
                         </ng-container>

                         <div *ngIf="expandedReactionMsgId !== msg._id" 
                              class="reaction-item p-1 hover-bg-light rounded-circle cursor-pointer d-flex align-items-center justify-content-center" 
                              style="width: 30px; height: 30px;"
                              (click)="$event.stopPropagation(); expandedReactionMsgId = msg._id">
                            <i class="bi bi-plus-lg fs-6 text-muted"></i>
                         </div>
                      </div>

                      <!-- Emoji Trigger -->
                      <button type="button" class="btn btn-sm rounded-circle emoji-trigger border-0 d-none d-md-flex align-items-center justify-content-center" 
                              [ngStyle]="{'background': isSentByMe(msg) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}"
                              style="width: 28px; height: 28px;"
                              (click)="$event.stopPropagation(); toggleReactionPanel(msg._id!)">
                        <i class="bi bi-emoji-smile fs-6" [style.color]="isSentByMe(msg) ? '#444' : '#888'"></i>
                      </button>
                    </div> <!-- End Wrapper -->

                  </div> <!-- End Content Column -->
                </div> <!-- End Message Loop -->
              </ng-container>
            </div>
          </div>
          
          <!-- WhatsApp-like Image/File Sending Experience (Overlay) -->
          <div *ngIf="selectedFile" class="p-3 border-top position-relative bg-light" style="z-index: 1060;">
            <div class="d-flex flex-column align-items-center bg-white rounded shadow-lg p-3 mx-auto" style="max-width: 500px; animation: slideUp 0.3s ease;">
               <!-- Preview Area -->
               <div class="position-relative w-100 mb-3 text-center bg-dark bg-opacity-10 rounded p-2" style="min-height: 200px;">
                  <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle" (click)="cancelFileSelection()">
                    <i class="bi bi-x-lg"></i>
                  </button>
                  <img *ngIf="selectedImagePreview" [src]="selectedImagePreview" class="img-fluid rounded shadow-sm" style="max-height: 300px;">
                  <div *ngIf="!selectedImagePreview" class="p-5 text-center">
                    <i class="bi bi-file-earmark-text fs-1 text-forest opacity-50"></i>
                    <p class="mb-0 text-muted fw-bold">{{ selectedFile.name }}</p>
                    <small class="text-muted">{{ (selectedFile.size / 1024).toFixed(1) }} KB</small>
                  </div>
               </div>
               <!-- Caption & Send -->
               <div class="w-100 d-flex gap-2 align-items-center">
                  <input type="text" class="form-control rounded-pill border-0 bg-light px-4" 
                         placeholder="Add a caption..." 
                         [(ngModel)]="imageCaption"
                         (keyup.enter)="sendMessage()">
                  <button class="btn btn-forest rounded-circle p-0 d-flex align-items-center justify-content-center shadow" 
                          style="width: 45px; height: 45px;"
                          (click)="sendMessage()">
                    <i class="bi bi-send-fill text-white fs-5"></i>
                  </button>
               </div>
            </div>
          </div>

          <!-- Blocked Notices -->
          <div *ngIf="isUserBlockedByMe()" class="p-3 bg-light border-top text-center" style="animation: fadeInUp 0.3s ease;">
             <p class="mb-1 text-muted small">You blocked this contact. Tap to unblock.</p>
             <button class="btn btn-outline-forest btn-sm rounded-pill px-4 fw-bold" (click)="unblockUser()">
               UNBLOCK
             </button>
          </div>

          <div *ngIf="isBlockedByOther()" class="p-3 bg-light border-top text-center" style="animation: fadeInUp 0.3s ease;">
             <p class="mb-0 text-muted small">You have been blocked from <strong>{{selectedUserName}}</strong>. You can no longer send messages.</p>
          </div>

          <!-- Message Input -->
          <div class="p-3 border-top bg-white" *ngIf="!selectedFile && !isUserBlockedByMe() && !isBlockedByOther()">
            <form (ngSubmit)="sendMessage()" class="row g-2 align-items-center position-relative">
              <div class="col-auto position-relative">
                 <button type="button" class="btn btn-link text-forest p-1" (click)="showPicker = !showPicker; $event.preventDefault(); $event.stopPropagation();">
                   <i class="bi bi-emoji-smile fs-4"></i>
                 </button>
                 <!-- Inline Emoji Picker -->
                 <div *ngIf="showPicker" class="emoji-picker-monolithic shadow-lg border rounded bg-white p-2 position-absolute">
                    <div class="d-flex flex-wrap gap-2 justify-content-center">
                       <div *ngFor="let e of liveEmojis" (click)="insertEmoji(e.code)" class="cursor-pointer hover-scale p-1">
                          <img [src]="e.gif" width="30" height="30">
                       </div>
                    </div>
                 </div>
              </div>
              <div class="col-auto">
                 <input type="file" #fileInput class="d-none" (change)="onFileSelected($event)" accept="image/jpeg,image/png,image/jpg">
                 <button type="button" class="btn btn-link text-forest p-1" (click)="fileInput.click()" title="Send images only">
                   <i class="bi bi-plus-lg fs-3 fw-bold"></i>
                 </button>
              </div>
              <div class="col">
                <input type="text" class="form-control border-0 shadow-sm rounded-pill px-4 bg-light text-dark" 
                       placeholder="Type your message..." 
                       style="font-size: 15px; height: 45px;"
                       name="newMessage" [(ngModel)]="newMessageText" 
                       (input)="onTyping()">
              </div>
              <div class="col-auto">
                <button type="submit" class="btn btn-forest rounded-circle shadow d-flex align-items-center justify-content-center" 
                        style="width: 45px; height: 45px;"
                        [disabled]="!newMessageText.trim() && !selectedFile">
                  <i class="bi bi-send-fill text-white"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Lightbox Modal -->
        <div *ngIf="viewingImageUrl" class="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" 
             style="background: rgba(0,0,0,0.92); z-index: 9999; animation: fadeIn 0.3s ease;">
           <div class="position-absolute top-0 end-0 m-4 d-flex align-items-center gap-3">
              <a [href]="viewingImageUrl" download target="_blank" class="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
                <i class="bi bi-download fs-5"></i>
              </a>
              <button class="btn btn-forest rounded-circle p-2 d-flex align-items-center justify-content-center shadow" style="width: 45px; height: 45px;" (click)="viewingImageUrl = null">
                <i class="bi bi-x-lg fs-5"></i>
              </button>
           </div>
           <img [src]="viewingImageUrl" class="img-fluid shadow-lg rounded" style="max-width: 90%; max-height: 85vh;">
        </div>
        
        <!-- Empty State -->
        <div class="col-md-8 col-lg-9 h-100 d-md-flex align-items-center justify-content-center d-none" *ngIf="!selectedUser()" style="background: #f8f9fa;">
          <div class="text-center p-5">
            <div class="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center mx-auto mb-4" style="width: 120px; height: 120px;">
              <i class="bi bi-chat-quote fs-1 text-forest"></i>
            </div>
            <h4 class="fw-bold text-forest">Select a conversation</h4>
            <p class="text-muted mx-auto" style="max-width: 320px;">Stay connected with agents and property owners instantly.</p>
          </div>
        </div>
      </div>
    </div>
  `,

  styles: [`
    .badge { --bs-badge-color: #000; }
    
    .chat-list-item { background: #fff !important; cursor: pointer; transition: 0.2s; border-radius: 10px; margin: 4px 8px; border: none !important; color: #000 !important; }
    .chat-list-item:hover, .chat-list-item.active-chat { background: #76d469d3 !important; }
    .chat-list-item.active-chat { border: 1px solid #05f301ff !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .chat-list-item.active-chat h6, .chat-list-item.active-chat .text-muted { color: #000 !important; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .btn-forest { background: #096a4d; color: #030303ff; border: none; }
    .btn-forest:hover { background: #074d38; }
    
    .media-container { max-width: 350px; transition: transform 0.2s; }
    .media-container:hover { transform: scale(1.01); }
    
    .ms-bubble { 
      padding: 6px 12px 18px 12px; 
      border-radius: 12px; 
      font-size: 14.5px; 
      position: relative; 
      min-width: 85px; 
      max-width: 100%;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
    .ms-bubble-sent { background: #dcf8c6; color: #303030; border-top-right-radius: 0; box-shadow: 0 1px 0.5px rgba(0,0,0,0.1) !important; }
    .ms-bubble-received { background: #fff; color: #303030; border-top-left-radius: 0; box-shadow: 0 1px 0.5px rgba(0,0,0,0.1) !important; }
    
    .msg-timestamp {
      position: absolute;
      bottom: 2px;
      right: 7px;
      font-size: 10px;
      color: rgba(0,0,0,0.45);
      line-height: normal;
    }
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
    .emoji-picker-monolithic { bottom: 60px; left: 0; z-index: 1000; width: 220px; }
    
    .text-primary { color: #dc3545 !important; }
    
    .reactions-overlay { 
      background: #fff; 
      border-radius: 30px; 
      padding: 4px 10px; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
      animation: slideUpFade 0.2s ease-out;
      white-space: nowrap;
      border: 1px solid rgba(0,0,0,0.05);
    }
    
    .reaction-item { transition: transform 0.2s ease; transform-origin: bottom; }
    .reaction-item:hover { transform: scale(1.4) translateY(-5px); z-index: 10; }
    
    .reaction-badge { 
      font-size: 10.5px; 
      transition: all 0.2s; 
      border: 1.5px solid #fff !important; 
      background: #fff; 
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .reaction-badge:hover { transform: translateY(-3px) scale(1.1); z-index: 10; }
    
    .emoji-trigger { visibility: hidden; opacity: 0; transition: all 0.2s; background: rgba(0,0,0,0.05); }
    .message-wrapper:hover .emoji-trigger { visibility: visible; opacity: 1; }
    .emoji-trigger:hover { background: rgba(0,0,0,0.1); transform: scale(1.1); }
    
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(10px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    @media (prefers-color-scheme: dark) {
      .reactions-overlay { background: #233138; border-color: #374045; }
      .reaction-badge { background: #111b21; border-color: #233138 !important; color: #d1d7db !important; }
    }
    .cursor-text { cursor: text; }
    .cursor-pointer { cursor: pointer; }
    .hover-scale:hover { transform: scale(1.2); transition: 0.2s; }
    .pulse-online {
      box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
      animation: pulse-online-anim 2s infinite;
    }
    @keyframes pulse-online-anim {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
    }
    
    @media (max-width: 767px) {
      .glass-panel { height: calc(100vh - 60px) !important; border-radius: 0 !important; }
      .sidebar-column { display: flex !important; width: 100% !important; }
      .chat-column { display: none !important; width: 100% !important; }
      .chat-active .sidebar-column { display: none !important; }
      .chat-active .chat-column { display: flex !important; }
      .emoji-trigger { visibility: visible !important; opacity: 1 !important; }
      .ms-bubble { font-size: 13.5px; max-width: calc(100vw - 60px); }
      .media-container { max-width: calc(100vw - 80px); }
      .message-wrapper { gap: 4px !important; }
    }
    @media (min-width: 768px) and (max-width: 991px) {
      .ms-bubble { font-size: 13.5px; }
    }

    /* WhatsApp Style Dropdown */
    .whatsapp-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 220px;
      background: #ffffff;
      border-radius: 8px;
      z-index: 1000;
      margin-top: 8px;
      transform-origin: top right;
      animation: fadeInZoom 0.2s ease-out;
    }
    
    @media (prefers-color-scheme: dark) {
      .whatsapp-dropdown { background: #233138; }
      .dropdown-item-wa { color: #d1d7db !important; }
      .dropdown-item-wa:hover { background: #182229 !important; }
    }
    
    .dropdown-item-wa {
      cursor: pointer;
      font-size: 14.5px;
      color: #3b4a54;
      transition: 0.2s;
      text-decoration: none;
    }
    
    .dropdown-item-wa:hover {
      background: #f5f6f6;
    }
    
    .contact-info-item {
      margin: 4px 8px;
      border-radius: 6px;
      border: 1px solid #76d469d3;
    }
    
    .hover-bg-light:hover { background-color: rgba(0,0,0,0.05); }
    
    @keyframes fadeInZoom {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .chat-header { position: sticky; top: 0; z-index: 1001; }

    /* Selection Mode Styles */
    .message-row-container { transition: all 0.3s ease; border-left: 4px solid transparent; }
    .message-row-container.selection-mode { cursor: pointer; }
    .message-row-container.selection-mode:hover { background: rgba(0, 0, 0, 0.03); }
    .message-row-container.selected-bg { background: rgba(9, 106, 77, 0.08) !important; border-left-color: var(--c-forest); }
    
    .custom-checkbox .form-check-input {
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid #adb5bd;
    }
    .custom-checkbox .form-check-input:checked {
        background-color: var(--c-forest);
        border-color: var(--c-forest);
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('scrollFrame') scrollFrame!: ElementRef;

  conversations = signal<Conversation[]>([]);
  currentMessages = signal<Message[]>([]);
  selectedUser = signal<string | null>(null);
  showChatMobile = signal<boolean>(false);
  
  currentUser = signal<User | null>(null);
  loading = true;
  apiBase = environment.apiUrl.replace('/api', '');
  
  selectedUserName = '';
  selectedUserProfilePhoto = '';
  selectedPropertyTitle = '';
  selectedPropertyId = '';
  newMessageText = '';
  
  selectedFile: File | null = null;
  selectedImagePreview: string | null = null;
  imageCaption = '';
  viewingImageUrl: string | null = null;
  showPicker = false;
  activeReactionMsgId: string | null = null;
  expandedReactionMsgId: string | null = null;
  
  // Selection & Block State
  selectionMode = false;
  selectedMessageIds = new Set<string>();
  isUserBlockedByMe = signal<boolean>(false);
  isBlockedByOther = signal<boolean>(false);

  liveEmojis = [
    { code: "👍", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d_1f3fc/512.gif" },
    { code: "💖", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f496/512.gif" },
    { code: "😂", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.gif" },
    { code: "😯", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f62f/512.gif" },
    { code: "😢", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f622/512.gif" },
    { code: "🙏", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f/512.gif" },
    { code: "🎉", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.gif" },
    { code: "🔥", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif" },
    { code: "😎", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/512.gif" },
    { code: "👎", gif: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/512.gif" }
  ];
  
  typingUser = signal<string | null>(null);
  typingTimeout: any;
  showChatMenu = false;

  toggleChatMenu(event: Event) {
    event.stopPropagation();
    this.showChatMenu = !this.showChatMenu;
  }

  // Add listener to close menu on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showChatMenu) {
      this.showChatMenu = false;
    }
  }

  autoSelectUserId = '';

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.authService.currentUser.subscribe(u => this.currentUser.set(u));
    
    this.route.queryParams.subscribe(params => {
      if (params['user']) {
        this.autoSelectUserId = params['user'];
        this.tryAutoSelect();
      }
    });
    
    effect(() => {
      if (this.currentMessages().length) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  ngOnInit() {
    this.loadConversations();
    
    if (this.currentUser()) {
      // Socket connection is now handled globally in HeaderComponent
      
      this.messageService.newMessage$.subscribe(msg => {
        if (msg) {
          const otherId = this.selectedUser();
          if (otherId && (this.getUserId(msg.from) === otherId || this.getUserId(msg.to) === otherId)) {
            // Prevent duplicates
            this.currentMessages.update(msgs => {
              if (msgs.some(m => m._id === msg._id)) return msgs;
              return [...msgs, msg];
            });
          } else {
            this.loadConversations();
          }
        }
      });
      
      this.messageService.typing$.subscribe(data => {
        if (data && data === this.selectedUser()) {
          this.typingUser.set(data);
          clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => this.typingUser.set(null), 3000);
        }
      });

      this.messageService.reaction$.subscribe(data => {
        if (data) {
          const msg = this.currentMessages().find(m => m._id === data.messageId);
          if (msg) msg.reactions = data.reactions;
        }
      });

      this.messageService.onlineStatus$.subscribe(data => {
        if (data) {
          this.conversations.update(convs => convs.map(c => {
            if (String(c.user._id) === String(data.userId)) {
              return { ...c, user: { ...c.user, isOnline: data.status === 'online' } };
            }
            return c;
          }));
        }
      });
    }
  }

  ngOnDestroy() {
    this.messageService.disconnect();
  }

  isSelectedUserOnline(): boolean {
    const selId = this.selectedUser();
    if (!selId) return false;
    const conv = this.conversations().find(c => String(c.user._id) === String(selId));
    return conv?.user?.isOnline || false;
  }

  getUserId(user: any): string {
    return user._id || user;
  }

  isSentByMe(msg: Message): boolean {
    return this.getUserId(msg.from) === this.currentUser()?._id;
  }

  loadConversations() {
    this.messageService.getConversations().subscribe({
      next: (res) => {
        this.conversations.set(res.data);
        this.loading = false;
        this.tryAutoSelect();
      },
      error: () => this.loading = false
    });
  }

  tryAutoSelect() {
    if (this.autoSelectUserId && this.conversations().length > 0) {
      const conv = this.conversations().find(c => String(c.user._id) === String(this.autoSelectUserId));
      if (conv && this.selectedUser() !== conv.user._id) {
        this.selectConversation(conv);
      }
      this.autoSelectUserId = ''; // Clear to prevent forcing selection again later
    }
  }

  selectConversation(conv: Conversation) {
    this.selectedUser.set(conv.user._id!);
    this.showChatMobile.set(true);
    
    // Clear unread count locally
    conv.unreadCount = 0;

    this.selectedUserName = conv.user.name || `${conv.user.firstName} ${conv.user.lastName}`.trim();
    this.selectedUserProfilePhoto = conv.user.profilePhoto || conv.user.profilePic || '';
    this.selectedPropertyTitle = conv.property?.title || '';
    this.selectedPropertyId = conv.property?._id || '';

    this.checkBlockStatus();
    this.cancelSelection();

    const roomId = [this.currentUser()!._id, conv.user._id].sort().join('_');
    this.messageService.joinRoom(roomId);
    
    this.messageService.getMessages(conv.user._id!).subscribe({
      next: (res) => {
        this.currentMessages.set(res.data);
        if (res.isBlockedByMe !== undefined) this.isUserBlockedByMe.set(res.isBlockedByMe);
        if (res.isBlockedByOther !== undefined) this.isBlockedByOther.set(res.isBlockedByOther);
      }
    });
  }

  backToList() {
    this.showChatMobile.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File too large (max 5MB)');
      return;
    }

    if (file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = file;
      this.selectedImagePreview = null;
    }
  }

  cancelFileSelection() {
    this.selectedFile = null;
    this.selectedImagePreview = null;
    this.imageCaption = '';
  }

  insertEmoji(code: string) {
    this.newMessageText += code;
    this.showPicker = false;
  }

  sendMessage() {
    if ((!this.newMessageText.trim() && !this.selectedFile) || !this.selectedUser() || this.isUserBlockedByMe() || this.isBlockedByOther()) return;
    
    const txt = this.selectedFile ? this.imageCaption : this.newMessageText;
    const file = this.selectedFile;
    
    this.newMessageText = '';
    this.selectedFile = null;
    this.selectedImagePreview = null;
    this.imageCaption = '';
    this.showPicker = false;

    this.messageService.sendMessage(this.selectedPropertyId, this.selectedUser()!, txt, file || undefined).subscribe({
      next: (res) => {
        const roomId = [this.currentUser()!._id, this.selectedUser()].sort().join('_');
        this.messageService.emitMessage(roomId, res.data);
        this.currentMessages.update(msgs => [...msgs, res.data]);
      },
      error: () => alert('Failed to send.')
    });
  }

  toggleReaction(message: Message, emojiCode: string) {
    this.messageService.reactToMessage(message._id!, emojiCode).subscribe(res => {
      message.reactions = res.data;
      const roomId = [this.currentUser()!._id, this.selectedUser()].sort().join('_');
      this.messageService.emitReaction(roomId, message._id!, res.data);
      this.activeReactionMsgId = null; // Close after reacting
    });
  }

  toggleReactionPanel(msgId: string) {
    if (this.activeReactionMsgId === msgId) {
      this.activeReactionMsgId = null;
      this.expandedReactionMsgId = null;
    } else {
      this.activeReactionMsgId = msgId;
      this.expandedReactionMsgId = null;
    }
  }

  getGroupedMessages() {
    const msgs = this.currentMessages();
    if (!msgs || msgs.length === 0) return [];
    
    // Sort oldest first for a natural timeline
    const sortedMsgs = [...msgs].sort((a, b) => 
      new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
    );

    const groups: { date: string, messages: Message[] }[] = [];
    
    sortedMsgs.forEach(msg => {
      const msgDate = new Date(msg.createdAt!);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      let label = '';
      
      if (msgDate.toDateString() === today.toDateString()) {
        label = 'TODAY';
      } else if (msgDate.toDateString() === yesterday.toDateString()) {
        label = 'YESTERDAY';
      } else {
        // Use standard DD/MM/YYYY or DD Month YYYY as seen in WhatsApp
        label = msgDate.toLocaleDateString('en-GB'); // Uses DD/MM/YYYY
      }
      
      const lastGroup = groups.length > 0 ? groups[groups.length - 1] : null;
      if (lastGroup && lastGroup.date === label) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date: label, messages: [msg] });
      }
    });
    
    return groups;
  }

  groupReactions(reactions: any[]) {
    const groups: { [key: string]: number } = {};
    reactions.forEach(r => groups[r.emojiCode] = (groups[r.emojiCode] || 0) + 1);
    return Object.keys(groups).map(code => ({ code, count: groups[code] }));
  }

  getEmojiUrl(code: string) {
    return this.liveEmojis.find(e => e.code === code)?.gif || '';
  }

  formatText(text: string) {
    let html = text;

    // Detect URLs and make them clickable (opens in new tab/Chrome)
    const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
    html = html.replace(urlRegex, (url) => {
      const display = url.length > 50 ? url.substring(0, 50) + '...' : url;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0d6efd;word-break:break-all;text-decoration:underline;" onclick="event.stopPropagation()">${display}</a>`;
    });

    // Replace emoji codes with animated images
    this.liveEmojis.forEach(e => {
      const img = `<img src="${e.gif}" width="20" height="20" class="mx-1">`;
      html = html.split(e.code).join(img);
    });
    return html;
  }

  onTyping() {
    if (this.selectedUser() && this.currentUser()) {
      const roomId = [this.currentUser()!._id, this.selectedUser()].sort().join('_');
      this.messageService.emitTyping(roomId, this.currentUser()!._id);
    }
  }

  scrollToBottom() {
    const el = document.getElementById('chatContainer');
    if (el) el.scrollTop = el.scrollHeight;
  }

  getImageUrl(path: string | undefined, name?: string): string {
    if (!path || path === '') {
      const initials = name ? encodeURIComponent(name) : 'User';
      return `https://ui-avatars.com/api/?name=${initials}&background=0d6efd&color=fff`;
    }
    if (path.startsWith('http')) return path;
    const base = environment.apiUrl.replace('/api', '');
    return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  }

  viewContactInfo() {
    if (this.selectedUser()) {
      this.router.navigate(['/profile', this.selectedUser()]);
    }
  }

  // --- SELECTION MODE METHODS ---

  selectMessages() {
    this.selectionMode = true;
    this.selectedMessageIds.clear();
    this.showChatMenu = false;
  }

  cancelSelection() {
    this.selectionMode = false;
    this.selectedMessageIds.clear();
  }

  toggleMessageSelection(msgId: string) {
    if (!this.selectionMode) return;
    if (this.selectedMessageIds.has(msgId)) {
      this.selectedMessageIds.delete(msgId);
    } else {
      this.selectedMessageIds.add(msgId);
    }
  }

  deleteSelected() {
    const ids = Array.from(this.selectedMessageIds);
    if (ids.length === 0) return;

    if (confirm(`Delete ${ids.length} selected message(s)?`)) {
      this.messageService.deleteMessages(ids).subscribe({
        next: () => {
          this.currentMessages.update(msgs => msgs.filter(m => !m._id || !this.selectedMessageIds.has(m._id)));
          this.cancelSelection();
          this.loadConversations(); // Update "Last Message" in sidebar
        },
        error: (err) => alert('Failed to delete messages.')
      });
    }
  }

  // --- BLOCKING METHODS ---

  blockUser() {
    const otherId = this.selectedUser();
    if (!otherId) return;

    if (confirm(`Block ${this.selectedUserName}? They will not be able to message you.`)) {
      this.messageService.blockUser(otherId).subscribe({
        next: () => {
          this.isUserBlockedByMe.set(true);
          // Update local currentUser in AuthService to reflect the new blocked list
          const current = this.currentUser();
          if (current) {
            const blocked = [...(current.blockedUsers || []), otherId];
            this.authService.updateCurrentUser({ blockedUsers: blocked });
          }
          this.showChatMenu = false;
        }
      });
    }
  }

  unblockUser() {
    const otherId = this.selectedUser();
    if (!otherId) return;

    this.messageService.unblockUser(otherId).subscribe({
      next: () => {
        this.isUserBlockedByMe.set(false);
        const current = this.currentUser();
        if (current) {
          const blocked = (current.blockedUsers || []).filter((id: string) => id !== otherId);
          this.authService.updateCurrentUser({ blockedUsers: blocked });
        }
      }
    });
  }

  checkBlockStatus() {
    const otherId = this.selectedUser();
    const current = this.currentUser();
    if (otherId && current && current.blockedUsers) {
      this.isUserBlockedByMe.set(current.blockedUsers.includes(otherId));
    } else {
      this.isUserBlockedByMe.set(false);
    }
  }

  confirmClearChat() {
    const otherId = this.selectedUser();
    if (!otherId) return;
    
    if (confirm('Are you sure you want to clear all messages in this chat? This cannot be undone.')) {
      this.messageService.clearChat(this.selectedUser()!).subscribe({
        next: () => {
          this.currentMessages.set([]);
          this.toast.success('Chat cleared successfully');
        },
        error: (err) => this.toast.error('Failed to clear chat')
      });
    }
  }

  confirmDeleteChat() {
    const otherId = this.selectedUser();
    if (!otherId) return;
    
    if (confirm('Are you sure you want to delete this entire conversation?')) {
      this.messageService.deleteChat(otherId).subscribe({
        next: () => {
          this.currentMessages.set([]);
          this.backToList();
          // Update conversation list
          this.conversations.update(prev => prev.filter(c => c.user._id !== otherId));
          this.showChatMenu = false;
        },
        error: (err) => console.error('Error deleting chat:', err)
      });
    }
  }
}
