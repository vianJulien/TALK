
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const core = {
    conf: { 
        url: '', key: '', model: '', persona: '你是TALK，一位有温度的AI个人助理。你拥有长期记忆能力，能记住用户说过的事情、偏好和计划。你会主动帮用户管理日程、整理便签，在对话中自然地调用你记住的信息。你的回复简洁、自然、有亲切感，不过度正式，像一个了解你的老朋友。每天第一次对话时，可以根据记忆简单问候用户当天的状态', temp: '1.0', maxTokens: '0', 
        freq: '0', pres: '0', minOutput: '0',
        apiFormat: 'openai', 
        p_warm: 50, p_direct: 50, p_intel: 50, p_empathy: 50, p_obed: 50 
    },
    voiceConf: { mode: 'native', key: '', voice: 'onyx' },
    
    mems: [], 
    evts: [], 
    sessions: {}, 
    currSessId: null,
    
    autoTTS: false,
    currUpload: { img: null, fileText: null, fileName: null },
    calDate: new Date(),
    selectedDateStr: ''
};

