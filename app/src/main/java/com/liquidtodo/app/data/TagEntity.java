package com.liquidtodo.app.data;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.Ignore;
import androidx.room.PrimaryKey;

@Entity(tableName = "tags")
public class TagEntity {

    @PrimaryKey
    @NonNull
    public String id = "";

    @NonNull
    public String name = "";

    @NonNull
    public String color = "#6A8DFF";

    public int sortOrder;

    public long createdAt;

    public TagEntity() {
    }

    @Ignore
    public TagEntity(@NonNull String id, @NonNull String name, @NonNull String color,
                     int sortOrder, long createdAt) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.sortOrder = sortOrder;
        this.createdAt = createdAt;
    }
}
