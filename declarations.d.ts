declare module 'react-native-vector-icons/MaterialCommunityIcons';
declare module 'react-native-permissions';
declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    transaction(
      callback: (tx: any) => void,
      error?: (error: any) => void,
      success?: () => void,
    ): void;
    executeSql(sqlStatement: string, args?: any[]): Promise<any>;
    close(): Promise<void>;
  }

  export interface OpenDatabaseOptions {
    name: string;
    location: 'default' | string;
    createFromLocation?: number | string;
  }

  export function openDatabase(
    params: OpenDatabaseOptions,
  ): Promise<SQLiteDatabase>; // ✅ CHỈ dành cho Promise API

  const SQLite: {
    openDatabase: typeof openDatabase;
    DEBUG(enable: boolean): void;
    enablePromise(enable: boolean): void;
  };

  export default SQLite;
}
declare module '@env' {
  export const BANNER_ID_REAL: string;
  export const INTERSTITIAL_ID_REAL: string;
  export const BANNER_ID_FAKE: string;
  export const ADS_ID: string;
}
// declare module 'react-native-sqlite-storage1' {
//   interface SQLiteDatabase {
//     executeSql(
//       statement: string,
//       params?: any[],
//     ): Promise<[Transaction, ResultSet]>;

//     transaction(scope: (tx: Transaction) => void): Promise<void>;

//     close(): Promise<void>;
//     sqlBatch(statements: Array<[string, any[]]>): Promise<void>;
//   }

//   interface Transaction {
//     executeSql(
//       sql: string,
//       args?: any[],
//       success?: (tx: Transaction, result: ResultSet) => void,
//       error?: (tx: Transaction, err: any) => boolean,
//     ): void;
//   }

//   interface ResultSet {
//     insertId?: number;
//     rowsAffected: number;
//     rows: {
//       length: number;
//       item(index: number): any;
//       raw(): any[];
//     };
//   }

//   interface SQLError {
//     code: number;
//     message: string;
//   }

//   interface DatabaseParams {
//     name: string;
//     location?: string;
//     createFromLocation?: number | string;
//     key?: string;
//   }

//   const SQLite: {
//     enablePromise(enabled: boolean): void;
//     openDatabase(options: DatabaseParams): Promise<SQLiteDatabase>;
//     deleteDatabase(options: DatabaseParams): Promise<void>;
//   };

//   export default SQLite;
// }

// // App-specific types
// export interface Test {
//   id: string;
//   title: string;
//   createdAt: number;
//   // Thêm các trường khác nếu cần
// }
