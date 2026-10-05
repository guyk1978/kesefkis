[1mdiff --git a/src/App.jsx b/src/App.jsx[m
[1mindex 4b74e69..dda6ebe 100644[m
[1m--- a/src/App.jsx[m
[1m+++ b/src/App.jsx[m
[36m@@ -3190,7 +3190,7 @@[m [mconst advertiserPageCreatedAt =[m
 {currentView === 'home' && ([m
   <div[m
   id="search-filters-section"[m
[31m-  className="bg-white p-4 md:p-5 mb-8 scroll-mt-20"[m
[32m+[m[32m  className="bg-transparent md:bg-white p-0 md:p-5 mb-8 scroll-mt-20"[m
 >[m
 [m
     {/* =================================================[m
[36m@@ -3204,7 +3204,7 @@[m [mconst advertiserPageCreatedAt =[m
         onClick={() =>[m
           setShowMobileSearchFilters((prev) => !prev)[m
         }[m
[31m-        className="w-full min-h-[58px] flex items-center justify-between gap-3 px-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-emerald-300 hover:bg-emerald-50/30 transition text-right"[m
[32m+[m[32m        className="w-full min-h-[58px] flex items-center justify-between gap-3 px-4 border-b border-slate-100 bg-white hover:bg-emerald-50/30 transition text-right"[m
       >[m
 [m
         <div className="flex items-center gap-2.5 min-w-0">[m
[36m@@ -3899,7 +3899,7 @@[m [mconst advertiserPageCreatedAt =[m
         onClick={() =>[m
           setShowMobileCategories((prev) => !prev)[m
         }[m
[31m-        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/30 transition"[m
[32m+[m[32m        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white border-b border-slate-100 hover:bg-emerald-50/30 transition"[m
       >[m
 [m
         <div className="flex items-center gap-2.5">[m
[36m@@ -4175,7 +4175,7 @@[m [mconst advertiserPageCreatedAt =[m
         onClick={() =>[m
           setShowMobileLocationSort((prev) => !prev)[m
         }[m
[31m-        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cyan-300 hover:bg-cyan-50/30 transition"[m
[32m+[m[32m        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white border-b border-slate-100 hover:bg-cyan-50/30 transition"[m
       >[m
 [m
         <div className="flex items-center gap-2.5">[m
