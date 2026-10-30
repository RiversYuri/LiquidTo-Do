package com.liquidtodo.app.data;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import java.util.List;

@Dao
public interface TagDao {

    @Query("SELECT * FROM tags ORDER BY sortOrder ASC, createdAt ASC")
    List<TagEntity> getAll();

    @Query("SELECT COUNT(*) FROM tags")
    int count();

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertAll(List<TagEntity> tags);

    @Query("DELETE FROM tags")
    void deleteAll();
}
