"use client";

import { useState, useMemo } from "react";
import { unitCategories, convertValue, UnitCategory, Unit, UnitData } from "@/lib/units";
import { ArrowLeftRight, Star, History, Search, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UnitConverter() {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>("Length");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("km");
  
  const [inputValue, setInputValue] = useState<string>("1");
  const [bulkInput, setBulkInput] = useState<string>("1\n5\n10\n100");
  const [searchQuery, setSearchQuery] = useState("");

  const [favorites, setFavorites] = useState<{from: string, to: string, category: UnitCategory}[]>([]);
  const [history, setHistory] = useState<{val: number, from: string, res: number, to: string, category: UnitCategory}[]>([]);

  const category = unitCategories.find(c => c.category === activeCategory) as UnitData;
  const filteredUnits = category.units.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const numValue = parseFloat(inputValue);
  const result = isNaN(numValue) ? null : convertValue(numValue, fromUnit, toUnit, activeCategory);

  const bulkResults = useMemo(() => {
     return bulkInput.split('\n').map(line => {
       const v = parseFloat(line.trim());
       if (isNaN(v)) return { val: line, res: null };
       return { val: v, res: convertValue(v, fromUnit, toUnit, activeCategory) };
     });
  }, [bulkInput, fromUnit, toUnit, activeCategory]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCategoryChange = (catName: UnitCategory) => {
    setActiveCategory(catName);
    const cat = unitCategories.find(c => c.category === catName)!;
    setFromUnit(cat.units[0].id);
    setToUnit(cat.units[1]?.id || cat.units[0].id);
    setSearchQuery("");
  };

  const saveToHistory = () => {
    if (result !== null && !isNaN(numValue)) {
      setHistory(prev => [{
        val: numValue,
        from: fromUnit,
        res: result,
        to: toUnit,
        category: activeCategory
      }, ...prev].slice(0, 10)); // keep last 10
    }
  };

  const toggleFavorite = () => {
    const isFav = favorites.find(f => f.from === fromUnit && f.to === toUnit && f.category === activeCategory);
    if (isFav) {
      setFavorites(favorites.filter(f => !(f.from === fromUnit && f.to === toUnit && f.category === activeCategory)));
    } else {
      setFavorites([...favorites, { from: fromUnit, to: toUnit, category: activeCategory }]);
    }
  };

  const isCurrentFavorite = favorites.some(f => f.from === fromUnit && f.to === toUnit && f.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
      
      {/* Left Column: Categories */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-2">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 overflow-y-auto max-h-[70vh] custom-scrollbar pr-2">
          {unitCategories.map(cat => (
            <button
              key={cat.category}
              onClick={() => handleCategoryChange(cat.category)}
              className={`p-3 rounded-xl text-left text-sm font-medium transition-colors ${
                activeCategory === cat.category 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-card hover:bg-muted text-card-foreground border border-border"
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Column: Converter */}
      <div className="flex-1 flex flex-col gap-6">
        
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{activeCategory} Converter</h2>
            <button 
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-colors ${isCurrentFavorite ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:bg-muted"}`}
              title="Toggle Favorite"
            >
              <Star className="w-5 h-5" fill={isCurrentFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Search Units */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search units..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            
            {/* From */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">From</label>
              <select 
                value={fromUnit} 
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-3 bg-muted/50 border border-border rounded-xl font-medium outline-none"
              >
                {filteredUnits.length > 0 ? filteredUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                )) : <option value={fromUnit}>{category.units.find(u => u.id === fromUnit)?.name}</option>}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center mt-6">
              <button 
                onClick={swapUnits}
                className="p-4 bg-muted hover:bg-primary/20 hover:text-primary rounded-full transition-all active:scale-95 border border-border"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* To */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">To</label>
              <select 
                value={toUnit} 
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-3 bg-muted/50 border border-border rounded-xl font-medium outline-none"
              >
                {filteredUnits.length > 0 ? filteredUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                )) : <option value={toUnit}>{category.units.find(u => u.id === toUnit)?.name}</option>}
              </select>
            </div>
          </div>

          <Tabs defaultValue="single" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="single">Single Value</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Conversion</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="animate-in fade-in zoom-in-95 data-[state=inactive]:hidden">
               <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                 <input
                   type="number"
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onBlur={saveToHistory}
                   className="text-3xl font-bold bg-muted/20 border border-border focus:border-primary outline-none py-4 px-4 rounded-xl transition-colors w-full"
                   placeholder="0"
                 />
                 <div className="flex justify-center">
                   <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">=</div>
                 </div>
                 <div 
                   className="text-3xl font-bold overflow-hidden text-ellipsis py-4 px-4 border border-transparent rounded-xl text-primary bg-primary/5"
                 >
                   {result !== null ? result.toLocaleString(undefined, { maximumSignificantDigits: 10 }) : "---"}
                 </div>
               </div>
            </TabsContent>
            <TabsContent value="bulk" className="animate-in fade-in zoom-in-95 data-[state=inactive]:hidden">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Input (One per line)</h4>
                   <textarea 
                     value={bulkInput}
                     onChange={(e) => setBulkInput(e.target.value)}
                     className="w-full h-[150px] p-3 text-sm font-mono bg-muted/20 border border-border rounded-lg outline-none focus:border-primary resize-none"
                     placeholder="1&#10;5&#10;10&#10;100"
                   />
                 </div>
                 <div>
                   <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Results</h4>
                   <div className="w-full h-[150px] p-3 text-sm font-mono bg-primary/5 text-primary border border-transparent rounded-lg overflow-y-auto">
                     {bulkResults.map((r, i) => (
                       <div key={i} className="mb-1 truncate">
                         {r.res !== null ? r.res.toLocaleString(undefined, { maximumSignificantDigits: 10 }) : "---"}
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </TabsContent>
          </Tabs>

        </div>

        {/* Favorites and History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Favorites */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex flex-col h-[300px]">
             <h3 className="font-semibold flex items-center gap-2 mb-4 text-amber-500">
               <Star className="w-4 h-4 fill-current" /> Favorites
             </h3>
             <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
               {favorites.length === 0 ? (
                 <div className="text-sm text-muted-foreground italic h-full flex items-center justify-center">No favorites added</div>
               ) : (
                 favorites.map((fav, i) => {
                   const c = unitCategories.find(c => c.category === fav.category);
                   const fU = c?.units.find(u => u.id === fav.from);
                   const tU = c?.units.find(u => u.id === fav.to);
                   if (!c || !fU || !tU) return null;
                   return (
                     <button 
                       key={i}
                       onClick={() => {
                         setActiveCategory(fav.category);
                         setFromUnit(fav.from);
                         setToUnit(fav.to);
                       }}
                       className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-colors text-sm"
                     >
                       <div className="flex flex-col items-start gap-1">
                         <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{fav.category}</span>
                         <span className="font-semibold">{fU.name} <ArrowLeftRight className="w-3 h-3 inline mx-1 opacity-50" /> {tU.name}</span>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                         <ArrowLeftRight className="w-4 h-4" />
                       </div>
                     </button>
                   );
                 })
               )}
             </div>
          </div>

          {/* History */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex flex-col h-[300px]">
             <div className="flex justify-between items-center mb-4 text-primary">
               <h3 className="font-semibold flex items-center gap-2">
                 <History className="w-4 h-4" /> Recent
               </h3>
               {history.length > 0 && (
                 <button onClick={() => setHistory([])} className="text-muted-foreground hover:text-destructive transition-colors">
                   <Trash2 className="w-4 h-4" />
                 </button>
               )}
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
               {history.length === 0 ? (
                 <div className="text-sm text-muted-foreground italic h-full flex items-center justify-center">No recent conversions</div>
               ) : (
                 history.map((h, i) => {
                   const c = unitCategories.find(cat => cat.category === h.category);
                   const fU = c?.units.find(u => u.id === h.from);
                   const tU = c?.units.find(u => u.id === h.to);
                   return (
                     <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/50 text-sm">
                       <div>
                         <span className="font-medium">{h.val.toLocaleString()}</span> <span className="text-muted-foreground">{fU?.symbol}</span>
                         <span className="mx-2 text-muted-foreground">=</span>
                         <span className="font-bold text-primary">{h.res.toLocaleString(undefined, {maximumSignificantDigits: 6})}</span> <span className="text-muted-foreground">{tU?.symbol}</span>
                       </div>
                     </div>
                   );
                 })
               )}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
