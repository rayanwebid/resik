<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image');
            $table->string('link')->nullable();
            $table->integer('order_num')->default(0);
            $table->timestamps();
        });

        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('content');
            $table->string('image')->nullable();
            $table->integer('views')->default(0);
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('video_url')->nullable();
            $table->date('event_date')->nullable();
            $table->timestamps();
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->text('question');
            $table->text('answer');
            $table->integer('order_num')->default(0);
            $table->timestamps();
        });

        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('media_path');
            $table->string('media_type')->default('image'); // image, video
            $table->string('category')->nullable();
            $table->timestamps();
        });

        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('history')->nullable();
            $table->text('vision')->nullable();
            $table->text('mission')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('logo')->nullable();
            $table->timestamps();
        });

        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo');
            $table->string('link')->nullable();
            $table->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('photo')->nullable();
            $table->integer('rating')->default(5);
            $table->text('comment');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('partners');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('galleries');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('news');
        Schema::dropIfExists('sliders');
        Schema::dropIfExists('settings');
    }
};
