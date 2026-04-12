# MosterAds - Technical Findings & Error Log

> **Rule:** Log all API discoveries, constraints, and solved errors here to prevent repeating mistakes.

## [2026-03-18] - Phase 0: Design to Code Handoff
- **Stitch Design Complete:** 6 screens generated and approved.
- **Architecture:** MVVM architecture mandated. No business logic in code-behind.
- **Key finding:** Instead of direct OpenAI/Anthropic APIs for everything, the architecture routes *all* text, image, and video generation through \al.ai\ (\al-ai/any-llm\ for copy, flux for images, kling/veo for video). This means users only need ONE API key stored in the \PasswordVault\. 

## [2026-03-18] - fal.ai .NET SDK Constraints
- **Missing NuGet:** The package ID "fal-ai" does not exist on NuGet. fal.ai does not have an official .NET SDK.
- **Implementation:** Use \System.Net.Http.HttpClient\ directly.
- **Base URL:** \https://queue.fal.run\
- **Auth header:** \Authorization: Key {fal-key}\
- **Pattern:** POST to queue -> poll GET for status -> GET result when complete.
- **Rule:** We will build \FalService\ as a typed HttpClient wrapper to avoid missing SDK issues.

## fal.ai Balance API - Does Not Exist
Tested endpoints - all return 404:
- \al.ai/api/billing/user-info\
- \al.ai/api/auth/keys/balance\
- \al.ai/api/billing/balance\

fal.ai does not expose a public balance API.
Final implementation: show HyperlinkButton "See fal.ai/dashboard for balance" opens https://fal.ai/dashboard in browser.

## Architecture Rule - Never Chain Dependent Calls
Key validation and balance fetch must always be independent operations with independent failure paths. A failed optional call must never affect a required status indicator. This rule applies to ALL future screens.

## WinUI 3 - ViewModel injection order (CRITICAL)
WRONG - causes silent x:Bind failure:
  public AdCopyPage()
  {
      this.InitializeComponent(); // x:Bind runs here
      ViewModel = App.GetService<AdCopyViewModel>(); // too late
  }

CORRECT - ViewModel must exist before InitializeComponent:
  public AdCopyPage()
  {
      ViewModel = App.GetService<AdCopyViewModel>(); // first
      this.InitializeComponent(); // x:Bind finds ViewModel
      this.DataContext = ViewModel; // patch for any {Binding}
  }

This rule applies to ALL pages to ensure x:Bind connects securely on initialization.

## [2026-03-23] - fal.ai LLM Endpoint - DEPRECATED
- **Issue:** \al-ai/any-llm\ is DEPRECATED as of 2025.
- **New Pattern:** \openrouter/router\ is the correct endpoint ID on fal.ai.
- **Queue URL:** \https://queue.fal.run/openrouter/router\
- **Payload:**
  {
    "model": "meta-llama/llama-4-maverick",
    "prompt": "your prompt here",
    "max_tokens": 4096
  }
- **Reasoning:** openrouter/router provides access to a wider variety of models including Llama 4, Gemini 2.5, and Claude, while keeping the standard fal.ai queueing infrastructure.
- **Rule:** When generating text or ad copy, always use \openrouter/router\ on fal.ai instead of the legacy \ny-llm\ endpoint.
