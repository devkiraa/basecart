const fs = require('fs');
const path = require('path');

const targetFilePath = 'd:/basecart/packages/merchant-dashboard/src/app/dashboard/page.tsx';
let content = fs.readFileSync(targetFilePath, 'utf8');

// We find the starting index
let startIndex = content.indexOf('activeTab === "store-design" && (() => {');
if (startIndex !== -1) {
  startIndex = content.lastIndexOf('          {/* 12. Store Design Tab */}', startIndex);
}

// We find the ending index
let endIndex = content.indexOf('activeTab === "payments" && (');
if (endIndex !== -1) {
  endIndex = content.lastIndexOf('          })()', endIndex);
}

if (startIndex === -1 || endIndex === -1) {
  console.error("Error: Start or End marker not found!", { startIndex, endIndex });
  process.exit(1);
}

const replacement = `          {/* 12. Store Design Tab */}
          {activeTab === "store-design" && (() => {
            const activeTheme = themes.find(t => t.status === "published") || selectedTheme || themes[0];
            const currentThemeSettings = activeTheme?.pageContent?.settings || {};

            const updateThemeSetting = (fieldId: string, value: any) => {
              if (!selectedTheme) return;
              const pageContent = selectedTheme.pageContent || {};
              const settings = pageContent.settings || {};
              const updatedSettings = {
                ...settings,
                [fieldId]: value
              };

              setSelectedTheme({
                ...selectedTheme,
                pageContent: {
                  ...pageContent,
                  settings: updatedSettings
                }
              });

              // Send updates to iframe storefront instantly via postMessage
              const iframe = document.getElementById("storefront-preview-iframe") as HTMLIFrameElement;
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                  type: "theme-update",
                  settings: updatedSettings
                }, "*");
              }
            };

            const handlePublishTheme = async (themeId: string) => {
              setLoading(true);
              try {
                const res = await fetch(\`\${API_URL}/store/themes/\${themeId}/publish\`, {
                  method: "POST",
                  headers: { Authorization: \`Bearer \${token}\` }
                });
                if (res.ok) {
                  const promoted = await res.json();
                  setActionSuccess(\`Theme "\${promoted.name}" is now active!\`);
                  await fetchThemes(promoted.themeId);
                } else {
                  alert("Failed to publish theme.");
                }
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            };

            const handleSelectThemeFromLibrary = async (libTheme: any) => {
              // Find if this theme already exists in themes list
              const existing = themes.find(t => t.name.toLowerCase() === libTheme.name.toLowerCase());
              if (existing) {
                await handlePublishTheme(existing.themeId);
                return;
              }

              setLoading(true);
              try {
                const res = await fetch(\`\${API_URL}/store/themes\`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: \`Bearer \${token}\`,
                  },
                  body: JSON.stringify({
                    name: libTheme.name,
                    templateBase: libTheme.templateBase,
                    colors: {
                      primary: libTheme.defaults.colorPrimary,
                      accent: libTheme.defaults.colorAccent
                    },
                    logoUrl: "",
                    pageContent: {
                      home: {
                        heroTitle: "BUILT FOR PERFORMANCE",
                        heroSubtext: "Premium collections for modern shoppers.",
                        ctaText: "SHOP NOW"
                      },
                      catalog: {
                        pageTitle: "Latest Catalog Arrivals",
                        pageSubtext: "Discover our premium selection."
                      },
                      checkout: {
                        pageTitle: "Secure Stripe & Razorpay Checkout",
                        instructions: "All transactions are fully encrypted."
                      },
                      settings: libTheme.defaults
                    }
                  })
                });

                if (res.ok) {
                  const newTheme = await res.json();
                  await handlePublishTheme(newTheme.themeId);
                } else {
                  alert("Failed to install theme.");
                }
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            };

            // CUSTOMIZER EDITOR VIEW
            if (customizerOpen) {
              const themeSettings = selectedTheme?.pageContent?.settings || {};
              return (
                <div className="space-y-6 animate-fade-in select-none">
                  {/* Header Bar */}
                  <div className="flex items-center justify-between bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setCustomizerOpen(false)}
                        className="px-3.5 py-1.5 border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-lg shadow-sm"
                      >
                        ← Back
                      </button>
                      <div>
                        <span className="text-[10px] font-extrabold text-[#4F46E5] uppercase tracking-wider block font-sans">Theme Customizer</span>
                        <h3 className="text-sm font-bold text-slate-800 leading-none mt-0.5">{selectedTheme ? selectedTheme.name : "Active Theme"}</h3>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCustomizerOpen(false)}
                        className="px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg shadow-sm"
                      >
                        Save & Close
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    {/* Left 2/3: Live Previewer Simulator */}
                    <div className="xl:col-span-2 bg-gradient-to-tr from-slate-50 via-slate-100/50 to-slate-50 border border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-6 min-h-[520px] relative overflow-hidden select-none">
                      {/* Device toggles */}
                      <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-350/40 z-10 shadow-sm">
                        <button
                          onClick={() => setPreviewMode("desktop")}
                          className={\`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase rounded-md transition-all \${
                            previewMode === "desktop" ? "bg-white text-slate-800 shadow-xs scale-102" : "text-slate-500 hover:text-slate-700"
                          }\`}
                        >
                          <Monitor className="h-3 w-3" />
                          <span>Desktop</span>
                        </button>
                        <button
                          onClick={() => setPreviewMode("mobile")}
                          className={\`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase rounded-md transition-all \${
                            previewMode === "mobile" ? "bg-white text-slate-800 shadow-xs scale-102" : "text-slate-500 hover:text-slate-700"
                          }\`}
                        >
                          <Smartphone className="h-3 w-3" />
                          <span>Mobile</span>
                        </button>
                      </div>

                      {/* Device Simulator Frame */}
                      {previewMode === "desktop" ? (
                        <div className="w-full h-[420px] bg-white rounded-2xl shadow-xl border border-slate-250/70 overflow-hidden flex flex-col relative animate-fade-in">
                          {/* Top URL Bar */}
                          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-50/75 select-none text-[10px] text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                            </div>
                            <div className="bg-slate-200/50 border border-slate-300/30 rounded px-4 py-0.5 text-[9px] font-mono w-60 text-center truncate">
                              {settings.subdomain || "demo"}.basecart.app
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Live Preview</span>
                          </div>
                          <iframe
                            id="storefront-preview-iframe"
                            src={\`\${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=\${selectedTheme?.templateBase || "Aura"}&previewPrimaryColor=\${encodeURIComponent(selectedTheme?.pageContent?.settings?.colorPrimary || selectedTheme?.colors?.primary || "#2563EB")}\`}
                            className="w-full flex-1 border-none bg-slate-50"
                          />
                        </div>
                      ) : (
                        <div className="w-64 h-[420px] bg-white rounded-[32px] shadow-2xl border-8 border-slate-900 overflow-hidden flex flex-col relative animate-fade-in">
                          {/* Speaker island */}
                          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-slate-900 w-16 h-3 rounded-full z-10 flex items-center justify-end px-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                          </div>
                          <iframe
                            id="storefront-preview-iframe"
                            src={\`\${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=\${selectedTheme?.templateBase || "Aura"}&previewPrimaryColor=\${encodeURIComponent(selectedTheme?.pageContent?.settings?.colorPrimary || selectedTheme?.colors?.primary || "#2563EB")}\`}
                            className="w-full h-full border-none bg-slate-50 pt-5"
                          />
                        </div>
                      )}
                    </div>

                    {/* Right 1/3: Settings Configuration Editor Panel */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col h-[520px]">
                      <div className="border-b border-slate-100 pb-3 mb-4 text-left">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Theme Settings</span>
                        <h4 className="text-sm font-black text-slate-800 leading-tight mt-0.5">{selectedTheme?.name} Defaults</h4>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-left no-scrollbar">
                        {THEME_SETTINGS_SCHEMA.map((group) => (
                          <div key={group.id} className="space-y-3">
                            <h5 className="text-[10px] font-black text-[#4F46E5] uppercase tracking-wider border-b border-slate-100 pb-1 font-sans">{group.title}</h5>
                            <div className="space-y-3 pt-1">
                              {group.fields.map((field) => {
                                const val = themeSettings[field.id] !== undefined ? themeSettings[field.id] : field.default;
                                return (
                                  <div key={field.id} className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-550 text-slate-600 font-sans">{field.label}</label>
                                    
                                    {field.type === "text" && (
                                      <input
                                        type="text"
                                        value={val || ""}
                                        onChange={(e) => updateThemeSetting(field.id, e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                                      />
                                    )}

                                    {field.type === "color" && (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="color"
                                          value={val || "#000000"}
                                          onChange={(e) => updateThemeSetting(field.id, e.target.value)}
                                          className="h-8 w-8 rounded border border-slate-200 cursor-pointer shrink-0"
                                        />
                                        <input
                                          type="text"
                                          value={val || ""}
                                          onChange={(e) => updateThemeSetting(field.id, e.target.value)}
                                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono w-full text-slate-800 focus:outline-none"
                                        />
                                      </div>
                                    )}

                                    {field.type === "select" && (
                                      <select
                                        value={val || ""}
                                        onChange={(e) => updateThemeSetting(field.id, e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-850 bg-white focus:outline-none"
                                      >
                                        {field.options?.map(opt => (
                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                      </select>
                                    )}

                                    {field.type === "checkbox" && (
                                      <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                                        <input
                                          type="checkbox"
                                          checked={!!val}
                                          onChange={(e) => updateThemeSetting(field.id, e.target.checked)}
                                          className="rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5"
                                        />
                                        <span className="text-[11px] font-semibold text-slate-500">Enable feature</span>
                                      </label>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // MARKETPLACE VIEW
            return (
              <div className="space-y-6 animate-fade-in select-none">
                
                {/* 1. Selected Theme Hero */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col xl:flex-row gap-6 p-6">
                  {/* Left Column vogue specs */}
                  <div className="flex-1 flex flex-col justify-between pr-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Store Layout</span>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-extrabold rounded-full uppercase tracking-wider shadow-xs">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                          <span>Active</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{activeTheme ? activeTheme.name : "Vogue"}</h2>
                        <span className="text-[9px] font-extrabold bg-[#4F46E5]/10 text-[#4F46E5] px-1.5 py-0.5 rounded uppercase tracking-wide">v{activeTheme?.version || "1.0.0"}</span>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                        {activeTheme?.description || "Clean and modern fashion theme layout designed to boost conversion rates and build trust."}
                      </p>

                      {/* checklist grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-650 font-bold pt-2">
                        {[
                          "Mobile Responsive",
                          "SEO Optimized",
                          "Fast Loading",
                          "Accessibility Ready"
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-2">
                            <span className="h-4.5 w-4.5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] font-extrabold text-[10px]">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-8">
                      <button
                        onClick={() => {
                          if (activeTheme) setSelectedTheme(activeTheme);
                          setCustomizerOpen(true);
                        }}
                        className="px-4.5 py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-102"
                      >
                        Customize Theme
                      </button>
                      <button
                        onClick={() => {
                          if (activeTheme) setSelectedTheme(activeTheme);
                          setCustomizerOpen(true);
                        }}
                        className="px-4.5 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-extrabold text-xs rounded-xl shadow-sm transition-all hover:scale-102"
                      >
                        Theme Settings
                      </button>
                      <a
                        href={getStorefrontLink(settings.subdomain || "demo")}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4.5 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-extrabold text-xs rounded-xl shadow-sm transition-all hover:scale-102 flex items-center gap-1"
                      >
                        <span>Preview Store</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                    </div>
                  </div>

                  {/* Right Column browser mockup preview */}
                  <div className="flex-1 bg-slate-50 border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between items-center gap-4 relative min-h-[340px]">
                    <div className="w-full flex justify-between items-center border-b border-slate-250 pb-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Storefront Simulator</span>
                      <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/30 shadow-xs">
                        <button
                          onClick={() => setPreviewMode("desktop")}
                          className={\`flex items-center gap-1 px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-md transition-all \${
                            previewMode === "desktop" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                          }\`}
                        >
                          <Monitor className="h-3 w-3" />
                          <span>Desktop</span>
                        </button>
                        <button
                          onClick={() => setPreviewMode("mobile")}
                          className={\`flex items-center gap-1 px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-md transition-all \${
                            previewMode === "mobile" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                          }\`}
                        >
                          <Smartphone className="h-3 w-3" />
                          <span>Mobile</span>
                        </button>
                      </div>
                    </div>

                    {/* Previews frames */}
                    {previewMode === "desktop" ? (
                      <div className="w-full h-[220px] bg-white rounded-lg shadow-md border border-slate-200 flex flex-col justify-between overflow-hidden relative animate-fade-in">
                        {/* URL bar */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1 bg-slate-50/70 text-[8px] text-slate-450 font-medium">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          </div>
                          <span className="truncate w-32 font-mono text-center mx-auto">{settings.subdomain || "demo"}.basecart.app</span>
                        </div>
                        <iframe
                          src={\`\${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=\${activeTheme?.templateBase || "Aura"}&previewPrimaryColor=\${encodeURIComponent(activeTheme?.pageContent?.settings?.colorPrimary || activeTheme?.colors?.primary || "#2563EB")}\`}
                          className="w-full flex-1 border-none bg-slate-50 pointer-events-none scale-90 origin-top"
                        />
                      </div>
                    ) : (
                      <div className="w-36 h-[220px] bg-white rounded-2xl shadow-md border-4 border-slate-800 flex flex-col justify-between overflow-hidden relative animate-fade-in">
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-800 w-10 h-1.5 rounded-full z-10 flex items-center justify-end px-1">
                          <span className="w-0.5 h-0.5 rounded-full bg-blue-500"></span>
                        </div>
                        <iframe
                          src={\`\${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=\${activeTheme?.templateBase || "Aura"}&previewPrimaryColor=\${encodeURIComponent(activeTheme?.pageContent?.settings?.colorPrimary || activeTheme?.colors?.primary || "#2563EB")}\`}
                          className="w-full h-full border-none bg-slate-50 pt-3 pointer-events-none scale-90 origin-top"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Theme Categories Filters */}
                <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 select-none">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pr-2">
                    {[
                      "All Themes",
                      "Fashion",
                      "Electronics",
                      "Home & Living",
                      "Beauty",
                      "Food",
                      "Minimal",
                      "Sports",
                      "Books"
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setVisibleThemeCount(6);
                        }}
                        className={\`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap \${
                          selectedCategory === cat
                            ? "bg-indigo-50 text-[#4F46E5]"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-55 hover:bg-slate-50"
                        }\`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => alert("Advanced filtering tools are preconfigured in Basecart Pro.")}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold rounded-lg shadow-sm shrink-0"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                    <span>Filter</span>
                  </button>
                </div>

                {/* 3. Theme Marketplace Grid Header */}
                <div className="space-y-1 text-left">
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Theme Marketplace</h3>
                  <p className="text-xs text-slate-500">Choose from professionally-crafted layouts optimized for sales conversion.</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {THEME_LIBRARY.filter(t => selectedCategory === "All Themes" || t.category === selectedCategory)
                    .slice(0, visibleThemeCount)
                    .map((theme) => {
                      const isCurrentActive = activeTheme?.name?.toLowerCase() === theme.name.toLowerCase();
                      return (
                        <div 
                          key={theme.name}
                          className={\`bg-white border rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-md \${
                            isCurrentActive ? "border-[#4F46E5] ring-1 ring-[#4F46E5]/40" : "border-slate-200 hover:border-slate-350"
                          }\`}
                        >
                          <div className="h-44 bg-slate-100 relative overflow-hidden select-none border-b border-slate-100">
                            <img 
                              src={theme.previewImage}
                              alt={theme.name}
                              className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300 filter brightness-[0.95]"
                            />
                            {/* Price capsule badge */}
                            <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-xs text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow-xs uppercase">
                              {theme.price}
                            </div>
                            
                            {/* New label tag */}
                            {theme.isNew && (
                              <div className="absolute top-3 left-3 bg-[#4F46E5] text-white font-black text-[9px] px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                                New
                              </div>
                            )}

                            {/* Hover overlay preview button */}
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setThemeToPreview(theme);
                                  setPreviewThemeModalOpen(true);
                                }}
                                className="px-3.5 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg shadow-lg hover:bg-slate-50 flex items-center gap-1.5 transform translate-y-1.5 group-hover:translate-y-0 transition-all duration-200"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-500" />
                                <span>Preview Theme</span>
                              </button>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="text-left">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-800">
                                  {theme.name}
                                </h4>
                                <span className="text-[9px] text-[#4F46E5] bg-indigo-50 border border-indigo-100/30 px-1.5 py-0.5 rounded font-extrabold uppercase">{theme.category}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2 min-h-[32px] font-medium">{theme.description}</p>
                            </div>

                            <div className="flex gap-2">
                              {isCurrentActive ? (
                                <div className="w-full text-center bg-indigo-50 border border-indigo-100 text-[#4F46E5] font-extrabold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1">
                                  <span>✓</span>
                                  <span>Active theme in use</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleSelectThemeFromLibrary(theme)}
                                    className="flex-1 py-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold rounded-lg text-xs shadow-sm transition-colors"
                                  >
                                    Apply Theme
                                  </button>
                                  <button
                                    onClick={() => {
                                      setThemeToPreview(theme);
                                      setPreviewThemeModalOpen(true);
                                    }}
                                    className="p-1.5 border border-slate-250 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-650 shadow-sm shrink-0"
                                    title="Quick Preview"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Load More Themes Button */}
                {THEME_LIBRARY.filter(t => selectedCategory === "All Themes" || t.category === selectedCategory).length > visibleThemeCount && (
                  <div className="text-center pt-2 select-none">
                    <button
                      onClick={() => setVisibleThemeCount(prev => prev + 3)}
                      className="px-5 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs shadow-xs hover:bg-slate-50 transition-colors"
                    >
                      Load More Themes
                    </button>
                  </div>
                )}

                {/* Fullscreen Theme Preview Modal */}
                {previewThemeModalOpen && themeToPreview && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col z-[9999] animate-fade-in font-sans">
                    {/* Modal Header */}
                    <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm select-none">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Marketplace Preview</span>
                        <h3 className="text-sm font-black text-slate-800 leading-none">{themeToPreview.name} Theme</h3>
                        <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">{themeToPreview.price}</span>
                      </div>

                      {/* Device switchers center */}
                      <div className="flex gap-1 bg-slate-200/50 p-0.5 rounded-lg border border-slate-300/30">
                        <button
                          onClick={() => setPreviewDevice("desktop")}
                          className={\`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase rounded-md transition-all \${
                            previewDevice === "desktop" ? "bg-white text-slate-800 shadow-xs scale-102" : "text-slate-500 hover:text-slate-700"
                          }\`}
                        >
                          <Monitor className="h-3 w-3" />
                          <span>Desktop</span>
                        </button>
                        <button
                          onClick={() => setPreviewDevice("tablet")}
                          className={\`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase rounded-md transition-all \${
                            previewDevice === "tablet" ? "bg-white text-slate-800 shadow-xs scale-102" : "text-slate-500 hover:text-slate-700"
                          }\`}
                        >
                          <Smartphone className="h-3 w-3 rotate-90" />
                          <span>Tablet</span>
                        </button>
                        <button
                          onClick={() => setPreviewDevice("mobile")}
                          className={\`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase rounded-md transition-all \${
                            previewDevice === "mobile" ? "bg-white text-slate-800 shadow-xs scale-102" : "text-slate-500 hover:text-slate-700"
                          }\`}
                        >
                          <Smartphone className="h-3 w-3" />
                          <span>Mobile</span>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setPreviewThemeModalOpen(false);
                            await handleSelectThemeFromLibrary(themeToPreview);
                          }}
                          className="px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg shadow-sm"
                        >
                          Apply Theme
                        </button>
                        <button
                          onClick={() => setPreviewThemeModalOpen(false)}
                          className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-55 hover:bg-slate-50 font-bold text-xs rounded-lg shadow-sm"
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    {/* Modal Frame Body */}
                    <div className="flex-1 bg-slate-100 flex items-center justify-center p-6 overflow-hidden">
                      {previewDevice === "desktop" && (
                        <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-slate-250/75 overflow-hidden flex flex-col relative animate-fade-in">
                          <iframe
                            src={\`\${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=\${themeToPreview.templateBase}&previewPrimaryColor=\${encodeURIComponent(themeToPreview.defaults.colorPrimary)}\`}
                            className="w-full flex-1 border-none bg-slate-50"
                          />
                        </div>
                      )}
                      {previewDevice === "tablet" && (
                        <div className="w-[768px] h-full bg-white rounded-[32px] shadow-2xl border-12 border-slate-900 overflow-hidden flex flex-col relative animate-fade-in">
                          <iframe
                            src={\`\${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=\${themeToPreview.templateBase}&previewPrimaryColor=\${encodeURIComponent(themeToPreview.defaults.colorPrimary)}\`}
                            className="w-full h-full border-none bg-slate-50"
                          />
                        </div>
                      )}
                      {previewDevice === "mobile" && (
                        <div className="w-[375px] h-[550px] bg-white rounded-[36px] shadow-2xl border-8 border-slate-900 overflow-hidden flex flex-col relative animate-fade-in">
                          <iframe
                            src={\`\${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=\${themeToPreview.templateBase}&previewPrimaryColor=\${encodeURIComponent(themeToPreview.defaults.colorPrimary)}\`}
                            className="w-full h-full border-none bg-slate-50"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Bottom Marketing Info Banners */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none pt-4 text-left">
                  {[
                    { label: "Mobile Responsive", desc: "Pixel-perfect mobile shopping experience." },
                    { label: "No Code Customization", desc: "No coding or Liquid templates required." },
                    { label: "High Speed Performance", desc: "95+ Lighthouse speed scores pre-tuned." },
                    { label: "Regular Upgrades", desc: "Free feature updates and fixes automatically." }
                  ].map((feat) => (
                    <div key={feat.label} className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs space-y-1">
                      <h4 className="text-xs font-black text-slate-800 leading-tight">{feat.label}</h4>
                      <p className="text-[10px] text-slate-405 text-slate-500 leading-normal font-medium">{feat.desc}</p>
                    </div>
                  ))}
                </div>

                {/* 5. Custom CTA Banner Contact our team */}
                <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-left select-none">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Can't find the perfect theme layout?</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Our design agency can craft custom brand-specific storefront options for you.</p>
                  </div>
                  <button 
                    onClick={() => alert("Please open a ticket in settings helpdesk to contact our designers.")}
                    className="px-4 py-2 border border-slate-250 text-slate-700 bg-white hover:bg-slate-50 text-xs font-extrabold rounded-lg shadow-sm shrink-0"
                  >
                    Contact Our Team
                  </button>
                </div>

                {/* 6. Dynamic Site Footer columns */}
                <footer className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 text-left select-none">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-slate-500">
                    <div>
                      <h5 className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider mb-3">Product</h5>
                      <ul className="space-y-2 font-semibold">
                        <li><a href="#features" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">Features</a></li>
                        <li><a href="#themes" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">Theme Store</a></li>
                        <li><a href="#pricing" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">SaaS Pricing</a></li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider mb-3">Resources</h5>
                      <ul className="space-y-2 font-semibold">
                        <li><a href="#docs" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">Documentation</a></li>
                        <li><a href="#tutorials" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">Video Tutorials</a></li>
                        <li><a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">Help Center</a></li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider mb-3">Company</h5>
                      <ul className="space-y-2 font-semibold">
                        <li><a href="#about" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">About Us</a></li>
                        <li><a href="#careers" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">Careers</a></li>
                        <li><a href="#blog" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">Blog Posts</a></li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider mb-3">Legal</h5>
                      <ul className="space-y-2 font-semibold">
                        <li><button onClick={() => setActiveTab("terms-of-service")} className="hover:text-slate-600 text-left">Terms of Service</button></li>
                        <li><button onClick={() => setActiveTab("privacy-policy")} className="hover:text-slate-600 text-left">Privacy Policy</button></li>
                        <li><button onClick={() => alert("Approved disputes are credited inside 14-days.")} className="hover:text-slate-600 text-left">Refund Policy</button></li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100 text-[11px]">
                    <span className="font-semibold">© 2026 Basecart. All rights reserved.</span>
                    <div className="flex gap-4 font-bold text-slate-500">
                      <a href="#fb" onClick={(e) => e.preventDefault()} className="hover:text-slate-700">Facebook</a>
                      <a href="#tw" onClick={(e) => e.preventDefault()} className="hover:text-slate-700">Twitter</a>
                      <a href="#in" onClick={(e) => e.preventDefault()} className="hover:text-slate-700">Instagram</a>
                    </div>
                  </div>
                </footer>
              </div>
            );
          })()}
`;

fs.writeFileSync(targetFilePath, content.substring(0, startIndex) + replacement + content.substring(endIndex + 12), 'utf8');
console.log("Success! Replaced Themes Tab programmatically.");
