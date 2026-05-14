import client from "../libs/HttpClients";

const ClassService = {
  async uploadClass({ file, extra = {} }) {
    const form = new FormData();
    if (file) form.append("classroomImage", file);
    // default uploadType as Image for file uploads
    form.append("uploadType", extra.uploadType || "Files");
    // optional passthrough fields (name/description/etc.)
    Object.entries(extra).forEach(([k, v]) => {
      if (v != null && k !== "uploadType") form.append(k, v);
    });

    const { data } = await client.post("/classroom/create", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async uploadMultipleClasses({ files = [], extra = {} }) {
    const list = Array.isArray(files) ? files : [];
    if (list.length === 0) throw new Error("At least one file is required");

    const form = new FormData();
    list.forEach((f) => {
      if (f) form.append("classroomImage", f);
    });
    form.append("uploadType", extra.uploadType || "Files");
    Object.entries(extra).forEach(([k, v]) => {
      if (v != null && k !== "uploadType") form.append(k, v);
    });

    const { data } = await client.post("/classroom/create-multiple", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async listClasses() {
    const { data } = await client.get("/classroom/list");
    return data;
  },

  async listAllClasses() {
    const { data } = await client.get("/classroom/list-all");
    return data;
  },

  async deleteClass({ id }) {
    const { data } = await client.delete(`/classroom/delete`, { data: { id } });
    return data;
  },

  async updateTargetGrade({ class_id, target_grade }) {
    const { data } = await client.put("/classroom/update-target-grade", {
      class_id,
      target_grade,
    });
    return data;
  },

  async updateShowInCalendar({ class_id, show_in_calendar }) {
    const { data } = await client.put("/classroom/update-show-in-calendar", {
      class_id,
      show_in_calendar,
    });
    return data;
  },

  async getClassSchedules(class_id) {
    const { data } = await client.get(`/classroom/${class_id}/schedules`);
    return data;
  },

  async updateScheduleShowInCalendar({ schedule_id, show_in_calendar }) {
    const { data } = await client.put("/classroom/update-schedule-show-in-calendar", {
      schedule_id,
      show_in_calendar,
    });
    return data;
  },

  async updateSchedulesShowInCalendar({ schedule_updates }) {
    const { data } = await client.put("/classroom/update-schedules-show-in-calendar", {
      schedule_updates,
    });
    return data;
  },

  async joinClass(class_id) {
    const { data } = await client.post("/classroom/join", { class_id });
    return data;
  },

  async leaveClass(class_id) {
    const { data } = await client.post("/classroom/leave", { class_id });
    return data;
  },

  async getClassMembers(class_id) {
    const { data } = await client.get(`/classroom/${class_id}/members`);
    return data;
  },
};

export default ClassService;
