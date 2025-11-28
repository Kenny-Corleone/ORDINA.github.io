
// Mock Firebase objects
const mockDb = {};
const mockLocalStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, val) { this.store[key] = val; }
};

// Mock Data
const userId = "user123";
const todayId = "2023-10-27"; // Today
const yesterdayId = "2023-10-26";

// Task created yesterday, not done
const tasks = [
    {
        id: "task1",
        data: {
            name: "Task from Yesterday",
            date: yesterdayId,
            status: "Не выполнено",
            carriedOver: false
        }
    }
];

// Mock Firestore functions
const query = () => "query";
const where = () => "where";
const getDocs = async () => {
    return tasks.map(t => ({
        id: t.id,
        data: () => t.data,
        ref: t.id
    }));
};
const writeBatch = () => ({
    updates: [],
    update(ref, data) {
        this.updates.push({ ref, data });
    },
    async commit() {
        console.log("Batch committing updates:", JSON.stringify(this.updates, null, 2));
        this.updates.forEach(u => {
            const task = tasks.find(t => t.id === u.ref);
            if (task) Object.assign(task.data, u.data);
        });
    }
});

// The Function to Test (reproduced from app.js)
async function checkAndCarryOverDailyTasks(todayId) {
    console.log(`Running check for ${todayId}...`);

    // Simulate fetching from DB
    const allDocs = await getDocs();

    // Filter like the query would (approx)
    const tasksToProcess = allDocs.filter(doc =>
        doc.data().status === "Не выполнено" &&
        doc.data().carriedOver === false &&
        doc.data().date < todayId
    );

    console.log("Tasks found to process:", tasksToProcess.length);

    if (tasksToProcess.length > 0) {
        const batch = writeBatch();
        tasksToProcess.forEach(doc => {
            // ORIGINAL LOGIC from app.js
            batch.update(doc.ref, { carriedOver: true });
        });
        await batch.commit();
    }
}

// Verification Logic
async function runTest() {
    console.log("Initial Task State:", JSON.stringify(tasks[0].data, null, 2));

    await checkAndCarryOverDailyTasks(todayId);

    console.log("Final Task State:", JSON.stringify(tasks[0].data, null, 2));

    // Check visibility
    const isVisibleToday = tasks[0].data.date === todayId;
    console.log("Is task visible in today's list (date == today)?", isVisibleToday);

    if (!isVisibleToday && tasks[0].data.carriedOver) {
        console.log("BUG REPRODUCED: Task marked carriedOver but date not updated.");
    } else {
        console.log("Bug not reproduced or already fixed.");
    }
}

runTest();
