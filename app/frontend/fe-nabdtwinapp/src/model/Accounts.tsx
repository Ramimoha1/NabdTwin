export interface UserAccount {
    username: String,
    email: String,
    password: String,
    role: "normal" | "admin",
    // permissions: permission | null,
};

export interface permission {
    viewBranches?: string[] ,
        viewReports?: boolean,
        viewInsights?: boolean,
        viewEmployees?: boolean ,
      // add all other permissions here
}



