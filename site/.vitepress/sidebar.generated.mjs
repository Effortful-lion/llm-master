// 本文件由 scripts/genSidebar.mjs 自动生成，请勿手改；重新生成请运行 npm run docs:prepare。
export default {
  "sidebar": {
    "/docs/llm/": [
      {
        "text": "应用开发",
        "collapsed": true,
        "items": [
          {
            "text": "Agent怎么评估？AI Agent任务完成率、步骤效率、错误恢复率和可靠性度量",
            "link": "/docs/llm/app/agent_evaluation"
          },
          {
            "text": "Agent为什么容易翻车？死循环、误调用、上下文污染、权限越界怎么兜底",
            "link": "/docs/llm/app/agent_failure_modes"
          },
          {
            "text": "Agent到底是什么？和普通大模型问答、ChatBot、Workflow有什么区别",
            "link": "/docs/llm/app/agent_intro"
          },
          {
            "text": "2026最全AI Agent 学习路线：怎么从零学 Agent 开发，该按什么顺序学",
            "link": "/docs/llm/app/agent_learning_roadmap"
          },
          {
            "text": "Agent的记忆：短期记忆、长期记忆、RAG到底什么关系",
            "link": "/docs/llm/app/agent_memory"
          },
          {
            "text": "工具设计决定Agent上限：Tool Use、Function Calling、参数Schema和返回值怎么设计",
            "link": "/docs/llm/app/agent_tool_design"
          },
          {
            "text": "Agent vs Workflow：什么时候根本不需要Agent，别把简单流程做复杂",
            "link": "/docs/llm/app/agent_vs_workflow"
          },
          {
            "text": "Browser Agent怎么读取大型网页？DOM清洗、可访问性树、局部读取与Token预算",
            "link": "/docs/llm/app/browser_agent_dom_context"
          },
          {
            "text": "RAG完整链路拆解：离线阶段和在线阶段到底做了什么",
            "link": "/docs/llm/app/chain_of_rag"
          },
          {
            "text": "上下文窗口有多大？Context Engineering上下文工程、滑动窗口、摘要压缩与记忆管理入门",
            "link": "/docs/llm/app/context_engineering"
          },
          {
            "text": "大模型部署方案怎么选？云API、托管推理、自部署与vLLM、SGLang选型",
            "link": "/docs/llm/app/deployment_options"
          },
          {
            "text": "Embedding是什么：语义压缩、模型选型、和Rerank的区别",
            "link": "/docs/llm/app/embedding"
          },
          {
            "text": "面试官怎么问微调？应用开发者该怎么答：选型逻辑、指标体系、对比实验和简历写法",
            "link": "/docs/llm/app/finetuning_interview"
          },
          {
            "text": "SFT、RLHF、DPO微调方法全景认知：监督微调、偏好对齐、强化学习和大模型应用选型",
            "link": "/docs/llm/app/finetuning_sft_rlhf_dpo"
          },
          {
            "text": "什么时候微调、什么时候RAG？大模型选型决策框架：数据量、任务类型、更新频率、成本四维判断",
            "link": "/docs/llm/app/finetuning_vs_rag"
          },
          {
            "text": "Function Calling详解：大模型怎么调用工具，为什么是Agent的基础",
            "link": "/docs/llm/app/function_calling"
          },
          {
            "text": "RAG切片策略：固定长度、递归字符、语义切分、结构感知四种方式对比",
            "link": "/docs/llm/app/how_to_chunking"
          },
          {
            "text": "KV Cache为什么会吃光显存？PagedAttention、Prefix Cache与大模型推理优化",
            "link": "/docs/llm/app/kv_cache_paged_attention"
          },
          {
            "text": "长文档与代码RAG怎么检索？结构化切分、Parent-Child、AST与版本权限过滤",
            "link": "/docs/llm/app/long_document_code_retrieval"
          },
          {
            "text": "LoRA、QLoRA低秩微调详解：为什么低秩微调这么流行，rank怎么设、显存怎么省",
            "link": "/docs/llm/app/lora_qlora"
          },
          {
            "text": "MCP协议详解：Agent工具调用的新标准，和Function Calling有什么区别",
            "link": "/docs/llm/app/mcp_protocol"
          },
          {
            "text": "大模型怎么接入真实应用？从聊天框到业务系统的完整链路",
            "link": "/docs/llm/app/model_integration"
          },
          {
            "text": "大模型量化怎么选？FP8、INT8、W4A16、AWQ、GPTQ、GGUF与KV Cache量化",
            "link": "/docs/llm/app/model_quantization"
          },
          {
            "text": "多Agent上下文、消息和Token怎么治理？独立Thread、Artifact与全局预算",
            "link": "/docs/llm/app/multi_agent_context_governance"
          },
          {
            "text": "Planner、Worker、Reviewer怎么分工？Multi-Agent角色边界、任务包与验收机制",
            "link": "/docs/llm/app/multi_agent_roles"
          },
          {
            "text": "Plan-and-Execute怎么落地成DAG执行器？拓扑调度、Checkpoint与局部Replan",
            "link": "/docs/llm/app/plan_execute_dag"
          },
          {
            "text": "Prompt Engineering不是\"写提示词\"：结构化Prompt设计、System/User/Assistant角色与模板变量",
            "link": "/docs/llm/app/prompt_engineering"
          },
          {
            "text": "Few-shot、CoT与自我反思面试题：示例学习、思维链提示和自检机制怎么选",
            "link": "/docs/llm/app/prompt_fewshot_cot_reflection"
          },
          {
            "text": "RAG评估体系:检索召回率、精准率、MRR、NDCG与生成质量RAGAS框架详解",
            "link": "/docs/llm/app/rag_evaluation"
          },
          {
            "text": "面试官怎么问RAG？RAG高频面试题、项目链路、选型优化与指标回答框架",
            "link": "/docs/llm/app/rag_interview_framework"
          },
          {
            "text": "RAG优化思路：Query改写、混合检索、Rerank、父子块检索、Context压缩",
            "link": "/docs/llm/app/rag_optimization"
          },
          {
            "text": "RAG系统答不准的常见问题：检索侧五类、生成侧四类问题逐一排查",
            "link": "/docs/llm/app/rag_problems"
          },
          {
            "text": "ReAct、Reflection、规划执行：Agent三种常见思路怎么选，面试怎么讲",
            "link": "/docs/llm/app/react_reflection_planning"
          },
          {
            "text": "大模型同步、异步、流式输出怎么选？三种调用方式详解",
            "link": "/docs/llm/app/streaming_output"
          },
          {
            "text": "大模型服务怎么压测？TTFT、TPOT、P99、吞吐、Goodput与容量规划",
            "link": "/docs/llm/app/stress_testing"
          },
          {
            "text": "大模型结构化输出：为什么自然语言不稳定，JSON Schema怎么约束",
            "link": "/docs/llm/app/structured_output"
          },
          {
            "text": "Token、成本与延迟：大模型API计费、TTFT、TPOT与应用优化",
            "link": "/docs/llm/app/token_cost_latency"
          },
          {
            "text": "向量数据库解决了什么问题：为什么不能用MySQL做向量检索、ANN索引原理",
            "link": "/docs/llm/app/vector_database"
          },
          {
            "text": "为什么有了大模型还需要RAG？幻觉、私有知识、时效性四大问题",
            "link": "/docs/llm/app/why_rag"
          }
        ]
      },
      {
        "text": "Claude Code",
        "collapsed": true,
        "items": [
          {
            "text": "为什么Agent时代大家都在做CLI？Claude Code、Codex与命令行的前世今生",
            "link": "/docs/llm/claude/agent_cli"
          },
          {
            "text": "百万行代码两周迁完：Anthropic如何用Claude Code做大规模代码迁移",
            "link": "/docs/llm/claude/ai_code_migration"
          },
          {
            "text": "Anthropic分析40万次Claude Code会话：领域能力、Agent成功率与程序员职业变化",
            "link": "/docs/llm/claude/claude_code_400k_sessions"
          },
          {
            "text": "Claude Code 高效使用指南：别把它当聊天框，5 件事把它调教成一个会自己干活的团队",
            "link": "/docs/llm/claude/claude_code_efficient_guide"
          },
          {
            "text": "深入理解 Claude Code：从 CLAUDE.md 到 Hooks、Skills、Subagents",
            "link": "/docs/llm/claude/claude_code_extensions_evolution"
          },
          {
            "text": "Claude Code怎么读懂大代码库？Agent搜索、CLAUDE.md、Hooks、Skills、MCP和LSP一篇讲明白",
            "link": "/docs/llm/claude/claude_code_large_codebase"
          },
          {
            "text": "Claude Code作者说“不写Prompt，写Loop”：AI编程从提示词到Agent闭环到底变了什么",
            "link": "/docs/llm/claude/claude_code_loop"
          },
          {
            "text": "Claude Code完整使用指南：CLAUDE.md、Skills、Subagents、MCP、Hooks、Plugins怎么配置",
            "link": "/docs/llm/claude/claude_code_toolkit_guide"
          },
          {
            "text": "CLAUDE.md到底怎么写？Claude Code项目记忆、团队规范和上下文管理一篇讲明白",
            "link": "/docs/llm/claude/claude_md"
          },
          {
            "text": "Claude Code 为什么快？Prompt Cache、Plan Mode、MCP工具加载和上下文压缩一篇讲明白",
            "link": "/docs/llm/claude/claude_prompt_cache"
          },
          {
            "text": "Claude Skills实战：Anthropic用了几百个Skill，总结出9大分类和写好Skill的全部经验",
            "link": "/docs/llm/claude/claude_skills"
          },
          {
            "text": "Claude Code 动态工作流详解：让 Claude 自己现写一套 harness，把一个任务拆给一队 Claude 去干",
            "link": "/docs/llm/claude/dynamic_workflows"
          },
          {
            "text": "Loop Engineering 实战：14 步路线图，从判断要不要做到上线后守住",
            "link": "/docs/llm/claude/loop_engineering_guide"
          },
          {
            "text": "Claude Managed Agents详解：把Agent的「大脑」和「双手」拆开，从原型到上线只要几天",
            "link": "/docs/llm/claude/managed_agents"
          }
        ]
      },
      {
        "text": "入门",
        "collapsed": true,
        "items": [
          {
            "text": "Agentic RAG是什么？从传统RAG、Advanced RAG到智能体检索的演进与原理",
            "link": "/docs/llm/intro/agentic_rag"
          },
          {
            "text": "Claude Code 和 Claude.ai 有什么区别？三层架构看懂 AI 编程产品",
            "link": "/docs/llm/intro/ai-coding-three-layers"
          },
          {
            "text": "大模型应用开发到底在做什么：和算法岗区别、日常关注什么、核心模块",
            "link": "/docs/llm/intro/app_dev_overview"
          },
          {
            "text": "大模型应用开发岗、算法岗、C++/Java/Go开发岗到底什么区别？谁替代谁了吗？",
            "link": "/docs/llm/intro/application_development"
          },
          {
            "text": "Claude Code为什么针对中国IP封号",
            "link": "/docs/llm/intro/claude_code_china_ip_ban"
          },
          {
            "text": "Claude Code怎么读懂大代码库",
            "link": "/docs/llm/intro/claude_code_large_codebase"
          },
          {
            "text": "Claude Code作者说“不写Prompt，写Loop",
            "link": "/docs/llm/intro/claude_code_loop"
          },
          {
            "text": "Claude Code完整使用指南",
            "link": "/docs/llm/intro/claude_code_toolkit_guide"
          },
          {
            "text": "CLAUDE.md到底怎么写",
            "link": "/docs/llm/intro/claude_md"
          },
          {
            "text": "Claude Code为什么快",
            "link": "/docs/llm/intro/claude_prompt_cache"
          },
          {
            "text": "Claude Fable 5被破解了？12万字系统提示词全曝光：你还没开口，3万token就没了",
            "link": "/docs/llm/intro/fable5_system_prompt_leak"
          },
          {
            "text": "GPT-5.6 Sol Prompt怎么写？别再沿用5.5的操作方式：精简提示词、自治边界、工具调用与迁移评测指南",
            "link": "/docs/llm/intro/gpt56_sol_prompt_guide"
          },
          {
            "text": "大模型到底是怎么训练出来的？预训练、模型参数、SFT微调、RLHF对齐、推理一次讲明白",
            "link": "/docs/llm/intro/how_llm_trained"
          },
          {
            "text": "大模型关键词全解：从Prompt到Agent到MCP，一篇搞懂13个核心概念",
            "link": "/docs/llm/intro/llm_keywords"
          },
          {
            "text": "2026最全大模型学习路线：从零入门到上手项目，该按什么顺序学",
            "link": "/docs/llm/intro/llm_learning_roadmap"
          },
          {
            "text": "大模型 API 到底怎么计费？一个汉字几个 token？GLM-5.1、GPT-5.4、Opus 4.7 算给你看",
            "link": "/docs/llm/intro/llm_pricing"
          },
          {
            "text": "大模型蒸馏到底是什么？硬蒸、软蒸、蒸馏其他厂商模型，一篇讲明白",
            "link": "/docs/llm/intro/model_distillation"
          },
          {
            "text": "用上Claude之后，只发了一句「你好」，为什么消耗了十万 token？",
            "link": "/docs/llm/intro/why_hello_costs_tokens"
          }
        ]
      },
      {
        "text": "动态",
        "collapsed": true,
        "items": [
          {
            "text": "ChatGPT、Claude、Grok集体宕机事件复盘：故障重叠93分钟，Azure、Cloudflare是元凶吗",
            "link": "/docs/llm/news/chatgpt-claude-grok-outage-sept-2026"
          },
          {
            "text": "ChatGPT暂停Pro 20X新订阅：200美元套餐为什么停售，现有用户、Codex和GPT-6 Astra受什么影响",
            "link": "/docs/llm/news/chatgpt-pro-20x-subscription-pause"
          },
          {
            "text": "Claude Code封号原因曝光：针对中国用户注入恶意代码？ 换了IP还是被封。",
            "link": "/docs/llm/news/claude_code_china_ip_ban"
          },
          {
            "text": "Claude永久提额25%其实回收17%？Tibo重置Codex额度，承认后台任务在烧你的用量",
            "link": "/docs/llm/news/claude-codex-usage-limits-reset"
          },
          {
            "text": "Claude大规模封号：Claude账号被封、Claude Code不能用，国内开发者怎么在Codex和Opus 4.8之间切换",
            "link": "/docs/llm/news/claude-crazy-0628"
          },
          {
            "text": "Claude Fable 5.1发布：缓存价降75%，和Opus 5、GPT-5.6 Sol怎么选",
            "link": "/docs/llm/news/claude-fable-5-1"
          },
          {
            "text": "Claude Fable 5重新开放：很强，也真的很贵，国内如何用上Opus4.8 和Fable5？",
            "link": "/docs/llm/news/claude-fable-5-7-2"
          },
          {
            "text": "Claude Fable 5发布：最强模型来了，但先别急着把Opus 4.8换掉",
            "link": "/docs/llm/news/claude-fable-5"
          },
          {
            "text": "Claude宣布给文字打上隐形水印：复制粘贴也会跟着走，Claude Code、API和C2PA内容凭证全面解析",
            "link": "/docs/llm/news/claude-invisible-text-watermark"
          },
          {
            "text": "Claude Opus 4.7 发布：编码能力暴涨、3倍高清视觉、新增xhigh档位，全面拆解",
            "link": "/docs/llm/news/claude-opus-4-7"
          },
          {
            "text": "Claude Opus 4.8发布：别被跑分带节奏，真正值得看的是Claude Code工作流",
            "link": "/docs/llm/news/claude-opus-4-8"
          },
          {
            "text": "Claude Opus 5发布：半价接近Fable 5，Claude Code和AI编程任务怎么选",
            "link": "/docs/llm/news/claude-opus-5"
          },
          {
            "text": "OpenAI Codex 重磅功能 Record & Replay 发布：录一遍操作就生成可复用 Skill，AI Agent 自动化的新玩法，和 Claude Skills、Computer Use 怎么比",
            "link": "/docs/llm/news/codex-record-replay"
          },
          {
            "text": "长鑫科技上市暴涨466%，市值3.28万亿：DRAM存储芯片为什么只有三星、SK海力士、美光和长鑫能规模量产",
            "link": "/docs/llm/news/cxmt-ipo-dram-barriers"
          },
          {
            "text": "DeepSeek大举招人，Agent Harness工程师火了：普通程序员怎么学Harness，怎么从AI套壳走到Agent工程",
            "link": "/docs/llm/news/deepseek-agent-harness-hiring"
          },
          {
            "text": "DeepSeek Harness安装与使用教程：官方dsh怎么配置API、操作代码仓库、跑Headless任务和高效使用",
            "link": "/docs/llm/news/deepseek-harness-guide"
          },
          {
            "text": "DeepSeek V4-Flash正式版上线：Agent跑分82.7，能替代Codex主力模型吗？",
            "link": "/docs/llm/news/deepseek-v4-flash-official"
          },
          {
            "text": "DeepSeek终于能看图了：V4-Flash-Vision-Exp识图、图表、ASCII和SVG实测，Harness多模态怎么用？",
            "link": "/docs/llm/news/deepseek-v4-flash-vision-exp"
          },
          {
            "text": "DeepSeek V4全系列正式版上线：Flash、Pro新定价，API最高涨12倍",
            "link": "/docs/llm/news/deepseek-v4-official-api-pricing"
          },
          {
            "text": "DeepSeek V4降价75%：我接上Claude Code跑了几天，说说真实感受",
            "link": "/docs/llm/news/deepseek-v4-price"
          },
          {
            "text": "DeepSeek V4-Pro永久降价75%：5月22日悄悄改了API定价页，这不是特惠了",
            "link": "/docs/llm/news/deepseek-v4-pro-permanent-price-cut"
          },
          {
            "text": "DeepSeek V4发布：1.6万亿参数开源MoE，百万上下文，价格只要GPT-5.5的十分之一",
            "link": "/docs/llm/news/deepseek-v4"
          },
          {
            "text": "GLM-5.2发布：智谱这次不放跑分表，先让你用上，开源、1M上下文、华为昇腾训练，和Opus 4.8、DeepSeek V4怎么选",
            "link": "/docs/llm/news/glm-5-2"
          },
          {
            "text": "GLM-5.3-Flash发布：320B总参数、18B激活、原生多模态，价格只有GLM-5.3十分之一，和DeepSeek V4、Kimi K3怎么选",
            "link": "/docs/llm/news/glm-5-3-flash"
          },
          {
            "text": "GLM-5.3发布：编程涨50%、安全能力意外爆发，和Kimi K3、DeepSeek V4、Claude怎么选",
            "link": "/docs/llm/news/glm-5-3"
          },
          {
            "text": "GPT-5.5发布：OpenAI最强Agent编程模型，稳定自主运行7小时，价格翻倍值不值？",
            "link": "/docs/llm/news/gpt-5-5"
          },
          {
            "text": "GPT-5.6发布后，Superpowers已经没必要学了？Agent Skill、Claude Code、Codex开发流程该做减法了",
            "link": "/docs/llm/news/gpt-5-6-no-superpowers"
          },
          {
            "text": "GPT-5.6正式发布：Sol、Terra、Luna怎么选？Codex并入ChatGPT，AI编程进入多智能体时代",
            "link": "/docs/llm/news/gpt-5-6"
          },
          {
            "text": "彻底杀疯了！分享9个让人惊艳的GPT-6 Astra案例：3D人体、V8发动机、Figma设计、PCB布局和游戏开发",
            "link": "/docs/llm/news/gpt-6-astra-amazing-cases"
          },
          {
            "text": "GPT-6 Astra正式发布：OpenAI最强AI Agent、Computer Use、API价格，和GPT-5.6 Sol、Claude Fable 5.1怎么选",
            "link": "/docs/llm/news/gpt-6-astra"
          },
          {
            "text": "GPT-6 Astra开始开放，Pro用户优先灰度，Plus用户再等等",
            "link": "/docs/llm/news/gpt-6-pro-rollout"
          },
          {
            "text": "混元Hy4 preview发布：770B开源、1M上下文、首度参与训练自己，和GLM-5.3、Kimi K3、DeepSeek V4怎么选",
            "link": "/docs/llm/news/hunyuan-hy4-preview"
          },
          {
            "text": "Kimi K2.7-Code发布并开源：1万亿参数MoE、256K上下文、思考token砍掉30%，和Claude Opus 4.8、GLM-5.2、DeepSeek V4怎么选",
            "link": "/docs/llm/news/kimi-k2-7-code"
          },
          {
            "text": "Kimi K3发布实测：2.8万亿参数、百万上下文，前端编程与美术审美凭什么冲到第一？",
            "link": "/docs/llm/news/kimi-k3"
          },
          {
            "text": "MiniMax M3评测：SWE-Bench Pro 59.0，1M上下文，原生多模态，真能替代Claude Code吗？",
            "link": "/docs/llm/news/minimax-m3"
          },
          {
            "text": "OpenAI突然终止与Cursor合作：AI编程工具用户如何用APIDock中转继续接入GPT-5.6、GPT-4o和o1模型",
            "link": "/docs/llm/news/openai-cursor-partnership-end"
          },
          {
            "text": "AI十分钟写完头像上传，却可能顺手埋下漏洞：Qoder Security把安全检查塞进写码会话",
            "link": "/docs/llm/news/qoder-security"
          }
        ]
      },
      {
        "text": "Transformer",
        "collapsed": true,
        "items": [
          {
            "text": "手撕Attention：不依赖框架从零实现注意力机制",
            "link": "/docs/llm/transformer/attention_code"
          },
          {
            "text": "残差连接、LayerNorm、FFN：Transformer里缺一不可的配角组件",
            "link": "/docs/llm/transformer/ffn_ln"
          },
          {
            "text": "手撕FFN：Transformer前馈网络代码实现",
            "link": "/docs/llm/transformer/fnn_code"
          },
          {
            "text": "手撕LayerNorm与残差连接：别让基础组件被忽略",
            "link": "/docs/llm/transformer/layernorm_residual_code"
          },
          {
            "text": "手撕Multi-Head Attention：从单头扩展到多头",
            "link": "/docs/llm/transformer/mha_code"
          },
          {
            "text": "Multi-Head Attention详解：为什么一个头不够，多头怎么拆分和拼接",
            "link": "/docs/llm/transformer/mha"
          },
          {
            "text": "位置编码详解：Transformer为什么必须知道Token顺序，正弦编码原理",
            "link": "/docs/llm/transformer/pos_encode"
          },
          {
            "text": "Attention计算全过程：从QK转置到Softmax加权求和一步步拆解",
            "link": "/docs/llm/transformer/qkv_cal"
          },
          {
            "text": "Attention机制详解：Q、K、V是什么，为什么它是Transformer的核心",
            "link": "/docs/llm/transformer/qkv"
          },
          {
            "text": "手撕Tiny Transformer：从零拼出一个完整模型",
            "link": "/docs/llm/transformer/tiny_transformer_code"
          },
          {
            "text": "为什么所有大模型都绕不开Transformer？RNN和CNN的短板在哪",
            "link": "/docs/llm/transformer/transformer_base_1"
          },
          {
            "text": "Encoder-only、Decoder-only、Encoder-Decoder三种架构详解与对比",
            "link": "/docs/llm/transformer/transformer_base_encoder_decoder"
          },
          {
            "text": "手撕Transformer Block：把Attention、FFN、Norm拼起来",
            "link": "/docs/llm/transformer/transformer_block_code"
          },
          {
            "text": "Transformer数据流动全解析：从输入文本到输出Token每一步做什么",
            "link": "/docs/llm/transformer/transformer_data_flow"
          },
          {
            "text": "一层Transformer Block长什么样？自注意力、FFN、残差、LayerNorm拼起来",
            "link": "/docs/llm/transformer/transformer_structure"
          }
        ]
      }
    ],
    "/docs/interview/": [
      {
        "text": "大模型",
        "collapsed": true,
        "items": [
          {
            "text": "字节Agent开发四面面经：21道大模型面试题全解析，从Prompt到Agent到MCP",
            "link": "/docs/interview/llm/20260506bytedance"
          },
          {
            "text": "Agent上下文漂移与工具调用幻觉大厂面试题：根因分析、检测信号、分层解法与面试回答思路",
            "link": "/docs/interview/llm/agent_drift_hallucination_interview"
          },
          {
            "text": "OpenClaw、Hermes Agent、Claude Code三框架横评：记忆机制、工具调用、上下文管理面试对比",
            "link": "/docs/interview/llm/agent_framework_comparison"
          },
          {
            "text": "Agent系统如何约束大模型幻觉：Prompt、工具调用、RAG证据、输出校验与兜底处理",
            "link": "/docs/interview/llm/agent_hallucination_control_interview"
          },
          {
            "text": "Agent Harness可观测性面试详解：生产级AI项目如何做好Trace、工具调用、上下文、成本与评测闭环",
            "link": "/docs/interview/llm/agent_harness_observability_interview"
          },
          {
            "text": "Agent混合路由优化大厂面试题：规则路由、模型路由、混合路由、级联降级与面试回答思路",
            "link": "/docs/interview/llm/agent_hybrid_routing_interview"
          },
          {
            "text": "2026年Agent/大模型大厂面试题汇总：ReAct、Function Calling、MCP、RAG高频问题与回答思路",
            "link": "/docs/interview/llm/agent_interview"
          },
          {
            "text": "Agent Skill面试详解：如何编写高质量Skill，提升Agent复用能力、上下文治理和工程落地效果",
            "link": "/docs/interview/llm/agent_skill_interview"
          },
          {
            "text": "AI增强开发三件套面试详解：OpenSpec、Superpowers、gstack怎么把Vibe Coding拉回工程交付",
            "link": "/docs/interview/llm/ai_enhanced_development_openspec_superpowers_gstack"
          },
          {
            "text": "字节Agent应用开发实习一面面经：ES混合检索、多Agent编排、三层记忆、QKV与算法题怎么答",
            "link": "/docs/interview/llm/bytedance_fanqie_agent_intern_interview"
          },
          {
            "text": "Claude Code上下文窗口面试详解：Auto-Compact、上下文压缩、工具结果裁剪与Agent记忆管理",
            "link": "/docs/interview/llm/claude_code_context_window_interview"
          },
          {
            "text": "Claude Code大厂面试题汇总：源码泄露、Agent Loop、系统提示词、工具链、上下文管理、安全机制全拆解 | 万字深度解析工作原理",
            "link": "/docs/interview/llm/claude_code_deep_dive"
          },
          {
            "text": "Claude Code为什么不用RAG检索代码？Grep、Glob、Read、子Agent与代码检索设计哲学面试详解",
            "link": "/docs/interview/llm/claude_code_grep_rag_interview"
          },
          {
            "text": "大模型微调面试详解：SFT、RLHF、DPO、PPO、强化学习和基模变强后的优化价值",
            "link": "/docs/interview/llm/finetuning_sft_rlhf_interview"
          },
          {
            "text": "Graph Engineering详解：从Loop Engineering到图编排，Agent节点、边、状态与并行面试题",
            "link": "/docs/interview/llm/graph_engineering_interview"
          },
          {
            "text": "GraphRAG与LightRAG大厂面试题汇总：从RAG到知识图谱检索，传统RAG天花板、GraphRAG原理与坑、LightRAG轻量方案",
            "link": "/docs/interview/llm/graphrag_interview"
          },
          {
            "text": "Harness Engineering大厂面试题汇总：从Prompt到Context到Harness，Hermes Agent与OpenClaw对比",
            "link": "/docs/interview/llm/harness_interview"
          },
          {
            "text": "Loop详解：从ReAct到Loop Engineering，Agent到底在循环什么｜Agent Loop面试题与回答思路",
            "link": "/docs/interview/llm/loop_engineering_interview"
          },
          {
            "text": "多Agent架构面试全解析：主Agent子Agent通信、编排、Tool取舍与工程代价",
            "link": "/docs/interview/llm/multi_agent_communication_interview"
          },
          {
            "text": "Multi-Agent Harness面试详解：未来竞争不是谁的Agent更多，而是谁的执行框架更稳",
            "link": "/docs/interview/llm/multi_agent_harness_interview"
          },
          {
            "text": "生产级Agent全景面试详解：系统架构、Harness工程、组织协作与人才能力",
            "link": "/docs/interview/llm/production_agent_architecture_harness_org_talent"
          },
          {
            "text": "RAG落地最难的地方在哪？大厂面试题：文档预处理、召回质量、生成忠实度与面试回答思路",
            "link": "/docs/interview/llm/rag_hardest_parts_interview"
          },
          {
            "text": "2026年RAG大厂面试题汇总：向量检索、混合检索、Rerank、幻觉处理高频问题与回答思路",
            "link": "/docs/interview/llm/rag_interview"
          },
          {
            "text": "Spec-Driven Development规约驱动开发：AI编程为什么越快越要先写规格",
            "link": "/docs/interview/llm/spec_driven_development_interview"
          },
          {
            "text": "Transformer大厂面试题汇总：应用开发者视角、Self-Attention、位置编码、三大架构选择与回答",
            "link": "/docs/interview/llm/transformer_interview"
          },
          {
            "text": "Vibe Coding避坑指南：Git提交、数据库备份、模块拆分、线上环境回滚怎么做才不翻车",
            "link": "/docs/interview/llm/vibe_coding_backup_engineering"
          },
          {
            "text": "2026年Vibe Coding大厂面试题汇总：AI编程时代核心竞争力、Token成本控制、实战回答思路",
            "link": "/docs/interview/llm/vibe_coding_interview"
          }
        ]
      }
    ],
    "/docs/roadmap/": [
      {
        "text": "Agent 专项路线",
        "link": "/docs/roadmap/agent"
      },
      {
        "text": "大模型应用开发路线",
        "link": "/docs/roadmap/application"
      },
      {
        "text": "开发者入门路线",
        "link": "/docs/roadmap/beginner"
      },
      {
        "text": "大模型求职与面试路线",
        "link": "/docs/roadmap/interview"
      }
    ],
    "/docs/topics/": [
      {
        "text": "Agent 专题",
        "link": "/docs/topics/agent"
      },
      {
        "text": "AI 编程专题",
        "link": "/docs/topics/ai-coding"
      },
      {
        "text": "部署与性能专题",
        "link": "/docs/topics/deployment"
      },
      {
        "text": "微调专题",
        "link": "/docs/topics/finetuning"
      },
      {
        "text": "RAG 专题",
        "link": "/docs/topics/rag"
      },
      {
        "text": "Transformer 专题",
        "link": "/docs/topics/transformer"
      }
    ],
    "/docs/qita/": [
      {
        "text": "国内 Claude 会员相关内容",
        "link": "/docs/qita/0002.claudepay"
      },
      {
        "text": "Claude 模型国内使用相关内容",
        "link": "/docs/qita/0020.no-claude-account-use-opus-4-8-fable-5"
      }
    ],
    "/docs/jianli/": [
      {
        "text": "llm",
        "collapsed": true,
        "items": [
          {
            "text": "大模型微调项目简历写法",
            "link": "/docs/jianli/llm/llm_8"
          }
        ]
      }
    ]
  }
}
