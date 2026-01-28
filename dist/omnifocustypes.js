// Core enums
export var Task;
(function (Task) {
    let Status;
    (function (Status) {
        Status[Status["Available"] = 0] = "Available";
        Status[Status["Blocked"] = 1] = "Blocked";
        Status[Status["Completed"] = 2] = "Completed";
        Status[Status["Dropped"] = 3] = "Dropped";
        Status[Status["DueSoon"] = 4] = "DueSoon";
        Status[Status["Next"] = 5] = "Next";
        Status[Status["Overdue"] = 6] = "Overdue";
    })(Status = Task.Status || (Task.Status = {}));
    let RepetitionMethod;
    (function (RepetitionMethod) {
        RepetitionMethod[RepetitionMethod["DeferUntilDate"] = 0] = "DeferUntilDate";
        RepetitionMethod[RepetitionMethod["DueDate"] = 1] = "DueDate";
        RepetitionMethod[RepetitionMethod["Fixed"] = 2] = "Fixed";
        RepetitionMethod[RepetitionMethod["None"] = 3] = "None";
    })(RepetitionMethod = Task.RepetitionMethod || (Task.RepetitionMethod = {}));
})(Task || (Task = {}));
export var Project;
(function (Project) {
    let Status;
    (function (Status) {
        Status[Status["Active"] = 0] = "Active";
        Status[Status["Done"] = 1] = "Done";
        Status[Status["Dropped"] = 2] = "Dropped";
        Status[Status["OnHold"] = 3] = "OnHold";
    })(Status = Project.Status || (Project.Status = {}));
})(Project || (Project = {}));
export var Folder;
(function (Folder) {
    let Status;
    (function (Status) {
        Status[Status["Active"] = 0] = "Active";
        Status[Status["Dropped"] = 1] = "Dropped";
    })(Status = Folder.Status || (Folder.Status = {}));
})(Folder || (Folder = {}));
export var Tag;
(function (Tag) {
    let Status;
    (function (Status) {
        Status[Status["Active"] = 0] = "Active";
        Status[Status["Dropped"] = 1] = "Dropped";
        Status[Status["OnHold"] = 2] = "OnHold";
    })(Status = Tag.Status || (Tag.Status = {}));
})(Tag || (Tag = {}));
