package com.liquidtodo.app.data;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import java.util.List;

@Dao
public interface TaskDao {

    @Query("SELECT * FROM tasks ORDER BY sortOrder ASC, createdAt ASC")
    List<TaskEntity> getAll();

    @Query("SELECT COUNT(*) FROM tasks")
    int count();

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertAll(List<TaskEntity> tasks);

    @Query("DELETE FROM tasks")
    void deleteAll();
}
