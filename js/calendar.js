// ==========================================
// CALENDAR & EVENTS MODULE
// ==========================================

const calendar = {
    // 确保日历页面拥有左右布局所需的结构
    // 桌面端由 CSS 显示为：左侧 60% 日历 / 右侧 40% 事件列表
    ensureLayout: () => {
        const page = document.getElementById('p-cal');
        const clockRow = document.querySelector('#p-cal .clock-row');
        const controls = document.querySelector('#p-cal .cal-controls');
        const grid = document.getElementById('cal-grid');
        const evtList = document.getElementById('evt-list');
        const addBox = document.getElementById('add-box');
        const selectedLabel = document.getElementById('selected-date-label');

        if (!page || !clockRow || !controls || !grid || !evtList || !addBox || !selectedLabel) return;
        if (document.getElementById('cal-layout')) return;

        const layout = document.createElement('div');
        layout.id = 'cal-layout';
        layout.className = 'cal-layout';

        const left = document.createElement('section');
        left.className = 'cal-left';

        const right = document.createElement('section');
        right.className = 'cal-right';

        const eventHeader = document.createElement('div');
        eventHeader.className = 'evt-panel-title';
        eventHeader.innerHTML = `计划日期： <span id="selected-date-label">${selectedLabel.innerText || core.selectedDateStr}</span>`;

        const oldLabelBlock = selectedLabel.parentElement;

        page.insertBefore(layout, clockRow);
        layout.appendChild(left);
        layout.appendChild(right);

        left.appendChild(clockRow);
        left.appendChild(controls);
        left.appendChild(grid);

        right.appendChild(eventHeader);
        right.appendChild(evtList);
        right.appendChild(addBox);

        if (oldLabelBlock && oldLabelBlock.parentElement) {
            oldLabelBlock.remove();
        }
    },

    // 切换月份
    changeMonth: (delta) => {
        core.calDate.setMonth(core.calDate.getMonth() + delta);
        calendar.renderCalendar();
    },
    
    // 选择日期
    selectDate: (dateStr) => {
        core.selectedDateStr = dateStr;
        calendar.renderCalendar(); 
        calendar.renderEvt(); 
    },
    
    // 渲染日历网格
    renderCalendar: () => {
        calendar.ensureLayout();

        const grid = document.getElementById('cal-grid');
        if (!grid) return; 
        
        const y = core.calDate.getFullYear();
        const m = core.calDate.getMonth();
        const firstDay = new Date(y, m, 1).getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        
        const title = document.getElementById('cal-title');
        if (title) title.innerText = `${y} / ${String(m+1).padStart(2,'0')}`;
        
        const label = document.getElementById('selected-date-label');
        if (label) label.innerText = core.selectedDateStr;
        
        grid.innerHTML = '';
        ['S','M','T','W','T','F','S'].forEach(d => grid.innerHTML += `<div class="cal-wk">${d}</div>`);
        for(let i=0; i<firstDay; i++) grid.innerHTML += `<div class="cal-day empty"></div>`;

        for(let d=1; d<=daysInMonth; d++) {
            const dStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const div = document.createElement('div');
            div.className = `cal-day ${dStr === core.selectedDateStr ? 'selected' : ''}`;
            if (core.evts.some(e => e.date === dStr)) div.classList.add('has-evt');
            div.innerText = d;
            div.onclick = () => calendar.selectDate(dStr);
            grid.appendChild(div);
        }
    },

    // 添加计划 (包含 AI 短评)
    addEv: async () => {
        const t = document.getElementById('ev-t').value;
        const txt = document.getElementById('ev-txt').value.trim();
        const date = core.selectedDateStr;
        if (txt) {
            const ev = { id: Date.now(), date, t, d: txt, n: 'Reviewing...' };
            core.evts.push(ev);
            core.evts.sort((a, b) => (a.date + a.t).localeCompare(b.date + b.t));
            localStorage.setItem('v11_evts', JSON.stringify(core.evts));
            
            calendar.renderCalendar(); 
            calendar.renderEvt();
            document.getElementById('ev-txt').value = '';
            
            // 异步请求 AI 对计划的简短评价
            if (core.conf.key) { 
                try { 
                    const res = await fetch(core.conf.url, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${core.conf.key}` }, 
                        body: JSON.stringify({ 
                            model: core.conf.model, 
                            messages: [
                                { role: 'system', content: core.conf.persona }, 
                                { role: 'user', content: `User added plan on ${date} at ${t}: "${txt}". Comment briefly (Chinese, <20 chars):` }
                            ], 
                            stream: false 
                        }) 
                    }); 
                    const j = await res.json(); 
                    ev.n = j.choices[0].message.content; 
                    localStorage.setItem('v11_evts', JSON.stringify(core.evts)); 
                    calendar.renderEvt(); 
                } catch (e) { console.error("Event comment failed", e); } 
            }
        }
    },
    
    // 删除计划
    delEv: (id) => { 
        core.evts = core.evts.filter(e => e.id !== id); 
        localStorage.setItem('v11_evts', JSON.stringify(core.evts)); 
        calendar.renderCalendar(); 
        calendar.renderEvt(); 
    },
    
    // 渲染当日计划列表
    renderEvt: () => { 
        calendar.ensureLayout();

        const b = document.getElementById('evt-list');
        if (!b) return;
        b.innerHTML = ''; 
        const dailyEvts = core.evts.filter(e => e.date === core.selectedDateStr);
        if (dailyEvts.length === 0) {
            b.innerHTML = '<div class="empty-events">暂无计划。</div>';
            return;
        }
        dailyEvts.forEach(e => { 
            b.innerHTML += `<div class="evt">
                <div class="evt-main"><b>${e.d}</b><span>${e.t}</span></div>
                <div class="evt-n">${e.n || ''}</div>
                <button class="del" onclick="calendar.delEv(${e.id})">×</button>
            </div>`; 
        }); 
    }
};