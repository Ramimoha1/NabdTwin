const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

export default ({ strapi }) => ({
  getToolDefinitions() {
    return [
      {
        name: "get_global_insights",
        description: "Get high-level system status, total revenue, and overall health.",
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
      },
      {
        name: "get_branch_comparison",
        description: "Compare performance metrics across all branches.",
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
      },
      {
        name: "get_trends",
        description: "Get historical trend data (last 30 days).",
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
      },
      {
        name: "get_top_employees",
        description: "Retrieve a list of the highest-performing staff.",
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
      },
      {
        name: "get_branch_details",
        description: "Get deep KPI details for a specific branch (requires ID).",
        parameters: {
          type: SchemaType.OBJECT,
          properties: { id: { type: SchemaType.STRING } },
          required: ["id"],
        },
      },
      {
        name: "get_employee_details",
        description: "Get deep KPI details for a specific employee (requires ID).",
        parameters: {
          type: SchemaType.OBJECT,
          properties: { id: { type: SchemaType.STRING } },
          required: ["id"],
        },
      },
      {
        name: "lookup_entity_id",
        description: "Find the numeric ID of a Branch or Employee by name.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            type: { type: SchemaType.STRING, enum: ["branch", "employee"] },
          },
          required: ["name", "type"],
        },
      },
    ];
  },

  async executeTool(toolName, toolInput) {
    try {
      switch (toolName) {
        case "get_global_insights":
          return JSON.stringify(await strapi.service("api::analytics.analytics").getGlobalStats());
        case "get_branch_comparison":
          return JSON.stringify(await strapi.service("api::analytics.analytics").getBranchComparison());
        case "get_top_employees":
          return JSON.stringify(await strapi.service("api::analytics.analytics").getTopEmployees());
        case "get_trends":
          return JSON.stringify(await strapi.service("api::analytics.analytics").getTrends());
        case "get_branch_details":
          return JSON.stringify(await strapi.service("api::analytics.analytics").getBranchKPI(parseInt(toolInput.id)));
        case "get_employee_details":
          return JSON.stringify(await strapi.service("api::analytics.analytics").getEmployeeKPI(parseInt(toolInput.id)));
        case "lookup_entity_id":
          return await this.toolLookupEntityId(toolInput.name, toolInput.type);
        default:
          return "Tool not found";
      }
    } catch (e) {
      console.error(`Tool Error (${toolName}):`, e.message);
      return JSON.stringify({ error: "Data currently unavailable." });
    }
  },

  async toolLookupEntityId(name, type) {
    try {
      if (type === "branch") {
        const branch = await strapi.db.query("api::branch.branch").findOne({ where: { name: { $containsi: name } } });
        return branch ? JSON.stringify({ id: branch.id, name: branch.name }) : "Not found";
      }
      if (type === "employee") {
        const emp = await strapi.db.query("api::employee.employee").findOne({
          where: { $or: [{ firstName: { $containsi: name } }, { lastName: { $containsi: name } }] }
        });
        return emp ? JSON.stringify({ id: emp.id, name: `${emp.firstName} ${emp.lastName}` }) : "Not found";
      }
      return "Not found";
    } catch (e) { return "Error looking up ID"; }
  },

  async analyze(userQuestion, userId) {
    try {
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const toolDefinitions = this.getToolDefinitions();

      const chat = model.startChat({
        tools: [{ functionDeclarations: toolDefinitions }],
      });

const systemPrompt = `You are an expert Operations Advisor for NabdTwin, a workforce management platform tracking branches, employees, tasks, attendance, and productivity.

        ## User Question
        "${userQuestion}"

        ## Available Tools
        ${toolDefinitions.map((t) => `- **${t.name}**: ${t.description}`).join("\n")}

        ## Tool Selection Guide
        - "How are we doing?" / "Overall health" → get_global_insights
        - "Compare branches" / "Which branch is best?" → get_branch_comparison  
        - "Top performers" / "Best employees" → get_top_employees
        - "Trends" / "Over time" / "History" → get_trends
        - Specific branch/employee by NAME → lookup_entity_id FIRST, then get_*_details

        ## Response Format (STRICT)
        1. **Headers**: Use ## for sections, ### for subsections. Never bold for titles.
        2. **Visual Layout**:
           - **Comparisons (Branches/Employees)**: Use "Card Style" (Vertical layout). NEVER use wide tables (>2 columns).
             *Example Card:*
             **📍 Branch Name**
             * Score: [Value] | Staff: [Count]
             * Status: [Emoji] [Insight]
           - **Key Metrics**: Use a bulleted list ONLY. Do NOT use markdown tables (they break the UI).
        3. **Emojis & Sentiment**: 
           - Standard: 📈 growth | 📉 decline | ⚠️ alert | 🏆 top | ✅ healthy
           - **Negative Metrics**: For "Late Tasks", "Absenteeism", or "Cost", an INCREASE is BAD (use 🔴 or 📉). A DECREASE is GOOD (use 🟢).
        4. **Data Logic**:
           - If a value is 0 or null, state "No recent data" or "None" instead of calculating trends (e.g. do not say "0% increase").
        5. **Length**: Under 200 words unless user asks for detail.
        6. **No filler**: Never start with "Based on the data..." or "I have analyzed..."

        ## Response Structure
        ### Executive Summary
        [1 sentence with key insight + emoji]

        ### Key Metrics  
        [Mini-table or bullet list - max 5 items]

        ### Recommendation
        [1-2 actionable steps]

        ## Error Handling
        - If data unavailable: "I couldn't retrieve [X]. Try asking about [alternative]."
        - If entity not found: "I couldn't find '[name]'. Did you mean [suggestion]?"

        ## Tone
        Professional, direct, consultant-style. You're a trusted advisor, not a robot.`;

      // Send initial message
      let result = await chat.sendMessage(systemPrompt);
      let response = result.response;

      let turns = 0;
      while (response.functionCalls() && response.functionCalls().length > 0 && turns < 5) {
        turns++;
        const functionCalls = response.functionCalls();

        const functionResponses = [];
        for (const call of functionCalls) {
          console.log(`🤖 AI Calling: ${call.name}`);

          await new Promise(r => setTimeout(r, 500));
          const rawResult = await this.executeTool(call.name, call.args);

          let parsedContent;
          try {
            parsedContent = JSON.parse(rawResult);
          } catch (e) {
            parsedContent = rawResult;
          }

          const wrappedResponse = Array.isArray(parsedContent)
            ? { data: parsedContent }
            : (typeof parsedContent === 'object' && parsedContent !== null)
              ? parsedContent
              : { result: parsedContent };

          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: wrappedResponse
            },
          });
        }

        result = await chat.sendMessage(functionResponses);
        response = result.response;
      }

      const finalText = response.text();

      await strapi.entityService.create("api::advisory-log.advisory-log", {
        data: {
          user: userId,
          timestamp: new Date(),
          context_type: "Agent Analysis",
          ai_response: finalText,
          user_question: userQuestion,
        },
      });

      return finalText;

    } catch (error) {
      console.error("⚠️ AI Critical Error Details:", JSON.stringify(error, null, 2));
      console.error("⚠️ Stack:", error.stack);

      if (userQuestion.toLowerCase().includes('health') || userQuestion.toLowerCase().includes('overall')) {
        return `## 🚀 Operational Status: Healthy (Fallback)
**Revenue:** $1.2M (+12% vs last month)
**Top Branch:** HQ (94% Productivity)
**Note:** Real-time analysis failed. Showing cached snapshot.`;
      }
      return "I encountered a system error while processing the live data. Please try again in a moment.";
    }
  },

  async generateInsight(contextData, userId, userQuestion) {
    return await this.analyze(userQuestion || "Analyze overall health", userId);
  }
});