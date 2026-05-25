"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { evaluate, format } from "mathjs";
import { useHistoryStore } from "@/store/historyStore";
import { Copy, Trash2, Check, Download, Search, Settings2, Settings, ChevronRight, X, Info } from "lucide-react";
import { format as formatFns, isToday, isYesterday } from "date-fns";

// A lot of code ...
