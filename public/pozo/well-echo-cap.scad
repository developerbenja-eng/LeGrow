// Tapa de eco — piezas imprimibles, v0.2
// OpenSCAD 2021.01 o mas nuevo. Elegir PART, renderizar (F6), exportar STL.
// Unidades: mm. Por defecto: casing PVC 2" Sch 40 y parlante de 36 mm.
//
// v0.2: el mic A se corre a mic_r = 26.5 mm para no pisar el marco del
// parlante; un canal de 1 mm une el puerto con su agujero de sonido.

PART = "fit_ring"; // [fit_ring, sleeve, box, lid, gasket_lid, gasket_flange, pod, pod_cap, all]

/* [Casing] */
casing_od = 60.3;   // 2" Sch 40. 4" Sch 40: 114.3
casing_id = 52.5;   // 2" Sch 40. 4" Sch 40: 102.3
fit       = 0.4;    // holgura radial de cada ajuste; afinar con fit_ring

/* [Parlante] */
spk_d     = 36.6;   // diametro del marco + 0.6
spk_rim   = 2.6;    // espesor del borde del marco = profundidad del asiento
spk_open  = 31;     // abertura bajo el cono

/* [Manga] */
flange    = 84;     // lado de la brida cuadrada
flange_t  = 6;
skirt_h   = 40;
skirt_w   = 3;
spigot_h  = 12;
spigot_w  = 2.4;
port_d    = 2.0;    // puerto acustico del mic A
port_r    = 20.9;   // distancia del puerto al centro
mic_r     = 26.5;   // centro de la placa del mic A
mic_pcb_d = 14.6;   // placa redonda INMP441; medir la tuya
groove_t  = 1.0;    // profundidad del canal puerto -> mic
cable_d   = 4.6;    // paso del cable colgante
cable_r   = 20.9;   // lado opuesto al puerto
bolt_off  = 34;     // cuadrado de pernos brida-caja, mitad del paso
bolt_d    = 3.4;    // paso M3
insert_d  = 4.0;    // agujero para inserto M3 termofijo; revisar los tuyos

/* [Caja] */
box_in     = [190, 90, 50];
box_w      = 2.4;
floor_t    = 3;
corner_r   = 6;
lid_t      = 3;
vent_d     = 12.3;  // venteo M12
floor_open = 72;    // abertura sobre la brida: parlante, mic A, cable
batt_x     = 66;    // centro del bolsillo de la LiPo
carrier_x  = -65;   // centro de la placa portadora

/* [Capsula] */
pod_od    = 20;
pod_len   = 34;
lead_d    = 4.6;

$fn = 96;
e = 0.01;
bore_r = casing_id/2 - fit - spigot_w;

assert(port_r - port_d/2 > spk_d/2, "el puerto del mic A corta el asiento del parlante");
assert(port_r + port_d/2 < bore_r, "el puerto del mic A cae fuera del spigot");
assert(mic_r - mic_pcb_d/2 > spk_d/2, "la placa del mic A pisa el marco del parlante");
assert(mic_r + mic_pcb_d/2 < floor_open/2, "la placa del mic A queda bajo el piso de la caja");
assert(cable_r - cable_d/2 > spk_d/2 && cable_r + cable_d/2 < bore_r,
       "el agujero del cable no cabe junto al parlante");

module rrect(size, r, h) {
  linear_extrude(h) offset(r = r) offset(delta = -r) square(size, center = true);
}

module tube(ro, ri, h) {
  difference() {
    cylinder(r = ro, h = h);
    translate([0, 0, -e]) cylinder(r = ri, h = h + 2*e);
  }
}

// Rebanada de 12 mm de la manga: probar el ajuste antes de imprimir la pieza real
module fit_ring() {
  difference() {
    union() {
      cylinder(r = casing_od/2 + fit + skirt_w, h = 2);
      tube(casing_od/2 + fit + skirt_w, casing_od/2 + fit, 12);
      tube(casing_id/2 - fit, bore_r, 12);
    }
    translate([0, 0, -e]) cylinder(r = bore_r, h = 3);
  }
}

// Se imprime con la brida abajo: z = 0 es la cara que toca la caja.
module sleeve() {
  difference() {
    union() {
      rrect([flange, flange], 6, flange_t);
      translate([0, 0, flange_t - e]) tube(casing_od/2 + fit + skirt_w, casing_od/2 + fit, skirt_h);
      translate([0, 0, flange_t - e]) tube(casing_id/2 - fit, bore_r, spigot_h);
      for (a = [0, 120, 240]) rotate(a)                  // resaltes de los tornillos mariposa
        translate([casing_od/2 + fit + skirt_w - 1, 0, flange_t + skirt_h - 12])
          rotate([0, 90, 0]) cylinder(d = 9, h = 5);
    }
    translate([0, 0, -e]) cylinder(d = spk_d, h = spk_rim + e);          // asiento del parlante
    translate([0, 0, -e]) cylinder(d = spk_open, h = flange_t + 2*e);    // abertura bajo el cono
    translate([port_r, 0, -e]) cylinder(d = port_d, h = flange_t + 2*e); // puerto del mic A
    translate([port_r, -port_d/2, -e])                                     // canal puerto -> mic A
      cube([mic_r - port_r, port_d, groove_t + e]);
    translate([-cable_r, 0, -e]) cylinder(d = cable_d, h = flange_t + 2*e);
    for (x = [-1, 1], y = [-1, 1])
      translate([x*bolt_off, y*bolt_off, -e]) cylinder(d = bolt_d, h = flange_t + 2*e);
    for (a = [0, 120, 240]) rotate(a)                    // insertos de los tornillos mariposa
      translate([casing_od/2 + fit - 1, 0, flange_t + skirt_h - 12])
        rotate([0, 90, 0]) cylinder(d = insert_d, h = skirt_w + 7);
  }
}

module box() {
  o = [box_in[0] + 2*box_w, box_in[1] + 2*box_w];
  lb = [box_in[0]/2 - 4, box_in[1]/2 - 4];
  difference() {
    union() {
      difference() {
        rrect(o, corner_r, floor_t + box_in[2]);
        translate([0, 0, floor_t]) rrect(box_in, corner_r - box_w, box_in[2] + e);
      }
      for (x = [-1, 1], y = [-1, 1]) {
        translate([x*lb[0], y*lb[1], 0]) cylinder(d = 8, h = floor_t + box_in[2]);    // tornillos de la tapa
        translate([x*bolt_off, y*bolt_off, 0]) cylinder(d = 8, h = floor_t + 5);     // tornillos de la brida
        translate([carrier_x + x*25, y*20, 0]) cylinder(d = 7, h = floor_t + 6);     // placa portadora
      }
      translate([batt_x, 0, floor_t - e]) difference() {                              // bolsillo de la LiPo
        rrect([56, 40], 2, 10);
        translate([0, 0, -e]) rrect([52, 36], 1, 10 + 2*e);
      }
    }
    translate([0, 0, -e]) cylinder(d = floor_open, h = floor_t + 2*e);
    for (x = [-1, 1], y = [-1, 1]) {
      translate([x*lb[0], y*lb[1], floor_t + box_in[2] - 6]) cylinder(d = insert_d, h = 6 + e);
      translate([x*bolt_off, y*bolt_off, -e]) cylinder(d = insert_d, h = floor_t + 5 + 2*e);
      translate([carrier_x + x*25, y*20, floor_t]) cylinder(d = insert_d, h = 6 + e);
    }
  }
}

// Se imprime con la cara exterior abajo; el labio calza dentro de la caja.
module lid() {
  o = [box_in[0] + 2*box_w, box_in[1] + 2*box_w];
  lb = [box_in[0]/2 - 4, box_in[1]/2 - 4];
  difference() {
    union() {
      rrect(o, corner_r, lid_t);
      translate([0, 0, lid_t - e]) difference() {
        rrect([box_in[0] - 0.6, box_in[1] - 0.6], corner_r - box_w, 3);
        translate([0, 0, -e]) rrect([box_in[0] - 4.6, box_in[1] - 4.6], corner_r - box_w - 1.5, 3 + 2*e);
      }
    }
    for (x = [-1, 1], y = [-1, 1]) {
      translate([x*lb[0], y*lb[1], -e]) cylinder(d = bolt_d, h = lid_t + 2*e);
      translate([x*lb[0], y*lb[1], lid_t]) cylinder(d = 9.5, h = 3 + e);   // el labio libra los resaltes
    }
    translate([-box_in[0]/4, 0, -e]) cylinder(d = vent_d, h = lid_t + 2*e);
  }
}

module gasket_lid() {
  o = [box_in[0] + 2*box_w, box_in[1] + 2*box_w];
  difference() {
    rrect(o, corner_r, 1.2);
    translate([0, 0, -e]) rrect([box_in[0] - 0.2, box_in[1] - 0.2], corner_r - box_w, 1.2 + 2*e);
  }
}

module gasket_flange() {
  difference() {
    rrect([flange, flange], 6, 1.2);
    translate([0, 0, -e]) cylinder(d = floor_open, h = 1.2 + 2*e);
    for (x = [-1, 1], y = [-1, 1])
      translate([x*bolt_off, y*bolt_off, -e]) cylinder(d = bolt_d, h = 1.2 + 2*e);
  }
}

// Se imprime con el puerto abajo. El agujero de sonido de la placa mira al puerto de 2 mm.
module pod() {
  difference() {
    cylinder(d = pod_od, h = pod_len);
    translate([0, 0, 2]) cylinder(d = mic_pcb_d + 0.4, h = pod_len);
    translate([0, 0, -e]) cylinder(d = 2, h = 2 + 2*e);
  }
}

module pod_cap() {
  difference() {
    union() {
      cylinder(d = pod_od, h = 3);
      translate([0, 0, 3 - e]) cylinder(d = mic_pcb_d + 0.2, h = 4);
    }
    translate([0, 0, -e]) cylinder(d = lead_d, h = 10);
  }
}

if (PART == "fit_ring") fit_ring();
else if (PART == "sleeve") sleeve();
else if (PART == "box") box();
else if (PART == "lid") lid();
else if (PART == "gasket_lid") gasket_lid();
else if (PART == "gasket_flange") gasket_flange();
else if (PART == "pod") pod();
else if (PART == "pod_cap") pod_cap();
else if (PART == "all") {
  sleeve();
  translate([0, 120, 0]) box();
  translate([0, 230, 0]) lid();
  translate([-100, 0, 0]) fit_ring();
  translate([90, 0, 0]) pod();
  translate([120, 0, 0]) pod_cap();
}
