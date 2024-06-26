/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "CompilationInfo.h"
#include "CompilationMessage.h"
#include "ShaderModule.h"
#include "mozilla/dom/WebGPUBinding.h"

namespace mozilla::webgpu {

GPU_IMPL_CYCLE_COLLECTION(CompilationInfo, mParent, mMessages)
GPU_IMPL_JS_WRAP(CompilationInfo)

CompilationInfo::CompilationInfo(Device* const aParent) : ChildOf(aParent) {}

void CompilationInfo::SetMessages(
    nsTArray<mozilla::webgpu::WebGPUCompilationMessage>& aMessages) {
  for (auto& msg : aMessages) {
    auto messageType = dom::GPUCompilationMessageType::Error;
    switch (msg.messageType) {
      case WebGPUCompilationMessageType::Error:
        messageType = dom::GPUCompilationMessageType::Error;
        break;
      case WebGPUCompilationMessageType::Warning:
        messageType = dom::GPUCompilationMessageType::Warning;
        break;
      case WebGPUCompilationMessageType::Info:
        messageType = dom::GPUCompilationMessageType::Info;
        break;
    }
    mMessages.AppendElement(MakeAndAddRef<mozilla::webgpu::CompilationMessage>(
        mParent, messageType, msg.lineNum, msg.linePos, msg.offset, msg.length,
        std::move(msg.message)));
  }
}

void CompilationInfo::GetMessages(
    nsTArray<RefPtr<mozilla::webgpu::CompilationMessage>>& aMessages) {
  for (auto& msg : mMessages) {
    aMessages.AppendElement(msg);
  }
}

}  // namespace mozilla::webgpu
